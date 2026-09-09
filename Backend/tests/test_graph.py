from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_get_graph():
    response = client.get("/graph")

    assert response.status_code == 200

    data = response.json()

    assert "nodes" in data
    assert "edges" in data