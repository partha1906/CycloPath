import urllib.request
import urllib.error
import json
import time
import sys
import subprocess
import os
import secrets

BASE = "http://127.0.0.1:8000/api"

def wait_for_server(url="http://127.0.0.1:8000/", timeout=15):
    start = time.time()
    while time.time() - start < timeout:
        try:
            with urllib.request.urlopen(url, timeout=1) as res:
                if res.status == 200:
                    return True
        except Exception:
            time.sleep(0.5)
    return False

def test_endpoint(name, url, method="GET", data=None, headers=None):
    try:
        req = urllib.request.Request(url, method=method)
        req.add_header("Content-Type", "application/json")
        if headers:
            for k, v in headers.items():
                req.add_header(k, v)
        body = json.dumps(data).encode("utf-8") if data else None
        with urllib.request.urlopen(req, data=body, timeout=5) as res:
            status = res.status
            content = json.loads(res.read().decode("utf-8"))
            print(f"[PASS] {name}: Status {status}, Keys: {list(content.keys()) if isinstance(content, dict) else len(content)}", flush=True)
            return True, content
    except urllib.error.HTTPError as e:
        content = e.read().decode("utf-8")
        print(f"[HTTP {e.code}] {name}: {content}", flush=True)
        return False, e.code
    except Exception as e:
        print(f"[FAIL] {name}: {e}", flush=True)
        return False, None

if __name__ == "__main__":
    print("Testing All Cyclopath AI Endpoints & Security Checks...", flush=True)
    server_proc = None
    if not wait_for_server(timeout=1):
        print("Starting background server for test runner...", flush=True)
        server_py = os.path.join(os.path.dirname(__file__), "server.py")
        test_env = os.environ.copy()
        test_env.update({
            "DEMO_MODE": "true",
            "ENABLE_DEMO_AUTH": "true",
            "JWT_SECRET": secrets.token_urlsafe(48),
            "AUTH_DEMO_ADMIN_PASSWORD": "ci-test-only-admin-password",
        })
        server_proc = subprocess.Popen([sys.executable, server_py], env=test_env)
        if not wait_for_server(timeout=10):
            print("Failed to start server process.", flush=True)
            if server_proc:
                server_proc.kill()
            sys.exit(1)

    all_passed = True
    try:
        # Public & Core Endpoints
        p1, _ = test_endpoint("Root Operational Probe", "http://127.0.0.1:8000/")
        p2, _ = test_endpoint("Cyclones Stream", f"{BASE}/cyclones")
        p3, _ = test_endpoint("Infrastructure Catalog", f"{BASE}/infrastructure")
        p4, _ = test_endpoint("Risk Summary", f"{BASE}/risk/summary")
        p5, _ = test_endpoint("Simulation Run", f"{BASE}/simulation", method="POST", data={"wind_speed_kmh": 180, "rainfall_mm": 400, "storm_surge_m": 5.0})
        p6, _ = test_endpoint("AI Agent Query", f"{BASE}/agent/query", method="POST", data={"query": "Which hospitals need backup power?", "district": "Puri", "language": "en"})
        p7, _ = test_endpoint("Route Optimize", f"{BASE}/routes/optimize", method="POST", data={"start_lat": 19.821, "start_lng": 85.845, "end_lat": 20.231, "end_lng": 85.778})
        p8, _ = test_endpoint("Alerts Feed", f"{BASE}/alerts")
        p9, _ = test_endpoint("Latest Report", f"{BASE}/reports/latest")
        p10, _ = test_endpoint("Health Observability", f"{BASE}/health")
        p11, _ = test_endpoint("Data Sources Provenance", f"{BASE}/data-sources")
        p12, _ = test_endpoint("Multimodal Safe Fallback", f"{BASE}/multimodal/analyze", method="POST", data={"asset_id": "TEST_HOSP_01", "context_notes": "Structural inspection"})

        # Authentication Checks
        p13, login_data = test_endpoint("Admin Login", f"{BASE}/auth/login", method="POST", data={"username": "admin", "password": "ci-test-only-admin-password"})
        admin_token = login_data.get("access_token") if isinstance(login_data, dict) else None

        p14, citizen_data = test_endpoint("Citizen Demo Token", f"{BASE}/auth/demo-token", method="POST", data={"role": "Public Citizen"})
        citizen_token = citizen_data.get("access_token") if isinstance(citizen_data, dict) else None

        # Profile Verification
        p15, _ = test_endpoint("Verified Admin Profile", f"{BASE}/auth/me", headers={"Authorization": f"Bearer {admin_token}"})

        # RBAC Security: Weights Reconfiguration
        p16, _ = test_endpoint("Admin Weights Update (Authorized)", f"{BASE}/risk/weights", method="POST", data={
            "cyclone_exposure": 0.25, "flood_exposure": 0.20, "storm_surge": 0.20,
            "infrastructure_vulnerability": 0.15, "accessibility_risk": 0.10, "population_criticality": 0.10
        }, headers={"Authorization": f"Bearer {admin_token}"})

        # RBAC Security: Alert Acknowledgment
        p17, _ = test_endpoint("Admin Alert Ack (Authorized)", f"{BASE}/alerts/1/ack", method="POST", headers={"Authorization": f"Bearer {admin_token}"})

        # Negative Security Test: Citizen forbidden from weights
        print("[TEST] Verifying Citizen Token Rejection on Admin Endpoint (expect HTTP 403)...", flush=True)
        _, code_citizen_weights = test_endpoint("Citizen Weights Update (Forbidden)", f"{BASE}/risk/weights", method="POST", data={
            "cyclone_exposure": 0.30, "flood_exposure": 0.20, "storm_surge": 0.20,
            "infrastructure_vulnerability": 0.10, "accessibility_risk": 0.10, "population_criticality": 0.10
        }, headers={"Authorization": f"Bearer {citizen_token}"})
        p18 = (code_citizen_weights == 403)
        if p18:
            print("[PASS] Security RBAC Confirmed: Citizen role correctly denied HTTP 403", flush=True)

        # Negative Security Test: Missing Token
        print("[TEST] Verifying Unauthenticated Request Rejection (expect HTTP 401)...", flush=True)
        _, code_no_auth = test_endpoint("Unauthenticated Weights Update (Unauthorized)", f"{BASE}/risk/weights", method="POST", data={
            "cyclone_exposure": 0.30, "flood_exposure": 0.20, "storm_surge": 0.20,
            "infrastructure_vulnerability": 0.10, "accessibility_risk": 0.10, "population_criticality": 0.10
        })
        p19 = (code_no_auth == 401)
        if p19:
            print("[PASS] Security Auth Confirmed: Missing token correctly denied HTTP 401", flush=True)

        all_passed = all([p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15, p16, p17, p18, p19])
        print(f"\nAll 19 Integration & Security Verification Checks: {'PASSED [OK]' if all_passed else 'FAILED [ERR]'}", flush=True)

    finally:
        if server_proc:
            server_proc.terminate()

    if not all_passed:
        sys.exit(1)
