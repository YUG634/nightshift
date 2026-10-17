import os
from dotenv import load_dotenv
from falkordb import FalkorDB
from redis.connection import Connection, BlockingConnectionPool

# Load .env variables
load_dotenv()

# Clean host string of any stray protocol prefixes or attached ports
raw_host = os.getenv("FALKORDB_HOST", "").strip()
HOST = (
    raw_host.replace("falkor://", "")
    .replace("rediss://", "")
    .replace("redis://", "")
    .split(":")[0]
)

PORT = int(os.getenv("FALKORDB_PORT", 62121))
USERNAME = os.getenv("FALKORDB_USERNAME", "default").strip()
PASSWORD = os.getenv("FALKORDB_PASSWORD", "").strip()
GRAPH = os.getenv("FALKORDB_GRAPH", "IncidentGraph")

print(f"Connecting to FalkorDB Cloud at {HOST}:{PORT} as '{USERNAME}'...")

# Standard TCP ConnectionPool (No SSL wrapping)
pool = BlockingConnectionPool(
    host=HOST,
    port=PORT,
    username=USERNAME,
    password=PASSWORD,
    connection_class=Connection,
    socket_timeout=15,
    socket_connect_timeout=15,
    socket_keepalive=True,
    max_connections=16,
    decode_responses=True
)

db = FalkorDB(connection_pool=pool)
g = db.select_graph(GRAPH)

# Run test query
result = g.query('RETURN 1 AS test').result_set
print("✅ Connection OK, query result:", result)