import asyncio
import httpx
import time

API_URL = "http://127.0.0.1:8000"

async def register_player(client, index):
    payload = {
        "full_name": f"Test Player {index}",
        "city": "Tashkent",
        "position": "Forward"
    }
    start = time.time()
    try:
        res = await client.post(f"{API_URL}/players", json=payload)
        if res.status_code == 200:
            player_id = res.json()["id"]
            return player_id, time.time() - start
    except Exception as e:
        print(f"Failed to register player {index}: {e}")
    return None, time.time() - start

async def get_players(client):
    start = time.time()
    try:
        await client.get(f"{API_URL}/players")
    except Exception:
        pass
    return time.time() - start

async def simulate_user(client, index):
    player_id, req_time = await register_player(client, index)
    if player_id:
        req_time2 = await get_players(client)
        return req_time + req_time2
    return req_time

async def run_load_test(users_count):
    print(f"\n--- Starting Load Test with {users_count} concurrent users ---")
    async with httpx.AsyncClient() as client:
        start_time = time.time()
        tasks = [simulate_user(client, i) for i in range(users_count)]
        results = await asyncio.gather(*tasks)
        total_time = time.time() - start_time
        
        avg_time = sum(results) / len(results)
        print(f"Total time taken: {total_time:.2f}s")
        print(f"Average time per user flow: {avg_time:.2f}s")
        
        return avg_time

async def main():
    print("Waiting for server to be ready...")
    # Add a short delay just in case we start this immediately after the server
    await asyncio.sleep(2) 
    
    # Check if server is running
    async with httpx.AsyncClient() as client:
        try:
            await client.get(f"{API_URL}/")
        except Exception:
            print("Server is not running. Please start the FastAPI server first on port 8000.")
            return

    # Scale up test
    user_loads = [10, 50, 100, 200, 500]
    
    for count in user_loads:
        avg_time = await run_load_test(count)
        if avg_time > 1.0: # If it takes more than 1 second per user on average, it's slowing down
            print(f"\n⚠️ System started slowing down at {count} concurrent users! (Avg response > 1s)")
            break
        await asyncio.sleep(1) # cool down

if __name__ == "__main__":
    asyncio.run(main())
