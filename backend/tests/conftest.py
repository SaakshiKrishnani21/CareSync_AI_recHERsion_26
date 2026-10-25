import os, sys, tempfile
os.environ["CARESYNC_DB"] = os.path.join(tempfile.mkdtemp(), "t.db")
os.environ["ANTHROPIC_API_KEY"] = "test"
os.environ["ADMIN_EMAILS"] = "boss@x.com"
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
