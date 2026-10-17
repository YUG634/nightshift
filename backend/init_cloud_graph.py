import os
from dotenv import load_dotenv
from falkordb import FalkorDB
from redis.connection import Connection, BlockingConnectionPool

load_dotenv()

raw_host = os.getenv("FALKORDB_HOST", "").strip()
HOST = raw_host.replace("falkor://", "").replace("rediss://", "").replace("redis://", "").split(":")[0]
PORT = int(os.getenv("FALKORDB_PORT", 62121))
USERNAME = os.getenv("FALKORDB_USERNAME", "falkordb").strip()
PASSWORD = os.getenv("FALKORDB_PASSWORD", "").strip()
GRAPH = os.getenv("FALKORDB_GRAPH", "IncidentGraph")

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
graph = db.select_graph(GRAPH)

# Seed Incident Graph
seed_query = """
CREATE 
  (alt:Alert {id: 'ALT-501', title: 'Error rate spike', status: 'CRITICAL'}),
  (srv:Service {id: 'SRV-CHECKOUT', title: 'Checkout API'}),
  (dep:Deployment {id: 'DEP-104', title: 'Production Dep #104'}),
  (cmt:Commit {id: 'COMMIT-9a1b', title: '9a1b8f2 - Auth SDK'}),
  (pr:PullRequest {id: 'PR-402', title: 'PR #402 - Bypass Check'}),
  (alt)-[:OBSERVED_ON]->(srv),
  (dep)-[:DEPLOYS]->(srv),
  (dep)-[:INCLUDES]->(cmt),
  (pr)-[:CONTAINS]->(cmt)
"""

try:
    print(f"Seeding '{GRAPH}' on {HOST}:{PORT}...")
    graph.query("MATCH (n) DETACH DELETE n")  # Clear previous nodes
    graph.query(seed_query)
    
    res = graph.query("MATCH (n) RETURN count(n) AS node_count")
    print(f" Success! Graph populated with {res.result_set[0][0]} nodes.")
except Exception as e:
    print(f" Failed to seed database: {e}")