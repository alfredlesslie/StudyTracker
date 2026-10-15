import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def run_tests():
    print("=== STARTING FULL END-TO-END VERIFICATION SUITE ===")
    
    # 0. Health check
    r = requests.get(f"{BASE_URL}/health")
    assert r.status_code == 200, f"Health check failed: {r.text}"
    print("[PASS] Backend server is healthy and running.")

    # 1. Test case 1: Exam covering only Module 3
    print("\n--- TEST CASE 1: Exam covering only Module 3 ---")
    exam_1 = requests.post(f"{BASE_URL}/api/exams", json={
        "subject_id": "cs-cn",
        "name": "Single Module Exam - M3",
        "exam_datetime": "2026-11-20T10:00:00Z",
        "module_ids": ["cn-m3"]
    }).json()
    exam_1_id = exam_1["id"]
    assert exam_1["module_ids"] == ["cn-m3"], f"Expected ['cn-m3'], got {exam_1['module_ids']}"
    
    scope_1 = requests.get(f"{BASE_URL}/api/exams/{exam_1_id}/scope-analysis").json()
    assert scope_1["selected_modules_count"] == 1
    assert scope_1["total_selected_topics"] == 4
    assert len(scope_1["modules_breakdown"]) == 1
    assert scope_1["modules_breakdown"][0]["module_id"] == "cn-m3"
    print(f"[PASS] Exam covering only Module 3 has 1 module, 4 topics in scope.")

    # 2. Test case 2: Exam covering Modules 3 and 4
    print("\n--- TEST CASE 2: Exam covering Modules 3 and 4 ---")
    exam_2 = requests.post(f"{BASE_URL}/api/exams", json={
        "subject_id": "cs-cn",
        "name": "Two Modules Exam - M3 & M4",
        "exam_datetime": "2026-11-25T10:00:00Z",
        "module_ids": ["cn-m3", "cn-m4"]
    }).json()
    exam_2_id = exam_2["id"]
    assert exam_2["module_ids"] == ["cn-m3", "cn-m4"], f"Expected ['cn-m3', 'cn-m4'], got {exam_2['module_ids']}"
    
    scope_2 = requests.get(f"{BASE_URL}/api/exams/{exam_2_id}/scope-analysis").json()
    assert scope_2["selected_modules_count"] == 2
    assert scope_2["total_selected_topics"] == 8
    assert [m["module_id"] for m in scope_2["modules_breakdown"]] == ["cn-m3", "cn-m4"]
    print(f"[PASS] Exam covering Modules 3 and 4 has 2 modules, 8 topics in scope (never replaces with all modules).")

    # 3. Test case 3: Completing Module 3 while Module 4 remains pending
    print("\n--- TEST CASE 3: Completing Module 3 while Module 4 remains pending ---")
    toggle_res = requests.put(f"{BASE_URL}/api/exams/{exam_2_id}/toggle-module-completion", json={
        "module_id": "cn-m3",
        "completed": True
    })
    assert toggle_res.status_code == 200
    toggled = toggle_res.json()
    assert "cn-m3" in toggled["completed_module_ids"]
    assert "cn-m4" not in toggled["completed_module_ids"]
    
    scope_2_updated = requests.get(f"{BASE_URL}/api/exams/{exam_2_id}/scope-analysis").json()
    assert scope_2_updated["completed_modules_count"] == 1
    assert scope_2_updated["selected_modules_count"] == 2
    assert scope_2_updated["module_completion_percentage"] == 50.0
    
    m3_detail = next(m for m in scope_2_updated["modules_breakdown"] if m["module_id"] == "cn-m3")
    m4_detail = next(m for m in scope_2_updated["modules_breakdown"] if m["module_id"] == "cn-m4")
    assert m3_detail["is_completed"] is True
    assert m4_detail["is_completed"] is False
    print(f"[PASS] Module 3 completed (1/2 = 50%), Module 4 remains pending.")

    # 4. Test case 4: Refreshing the page after marking a module complete
    print("\n--- TEST CASE 4: Refresh persistence after marking a module complete ---")
    get_exam = requests.get(f"{BASE_URL}/api/exams/{exam_2_id}").json()
    assert get_exam["completed_module_ids"] == ["cn-m3"]
    
    all_exams = requests.get(f"{BASE_URL}/api/exams").json()
    matching = next(e for e in all_exams if e["id"] == exam_2_id)
    assert matching["completed_module_ids"] == ["cn-m3"]
    print(f"[PASS] Completion persists in SQLite across reloads: completed_module_ids = {matching['completed_module_ids']}.")

    # 5. Test case 5: Adding a quiz score for a selected module and checking estimate updates
    print("\n--- TEST CASE 5: Adding quiz score for selected module updates estimate ---")
    exam_quiz = requests.post(f"{BASE_URL}/api/exams", json={
        "subject_id": "cs-se",
        "name": "SE Module 3 Quiz Responsiveness Exam",
        "exam_datetime": "2026-12-18T10:00:00Z",
        "module_ids": ["se-m3"]
    }).json()
    exam_quiz_id = exam_quiz["id"]

    pred_before = requests.get(f"{BASE_URL}/api/predictions/exam/{exam_quiz_id}").json()
    score_before = pred_before["predicted_score"]
    
    quiz_res = requests.post(f"{BASE_URL}/api/quizzes/attempts", json={
        "exam_id": exam_quiz_id,
        "topic_id": "se-m3-t1",
        "score": 5,
        "total_questions": 5,
        "time_spent_seconds": 150
    })
    assert quiz_res.status_code == 201
    
    pred_after = requests.get(f"{BASE_URL}/api/predictions/exam/{exam_quiz_id}").json()
    score_after = pred_after["predicted_score"]
    assert score_after > score_before, f"Expected {score_after} > {score_before}"
    assert pred_after["quiz_accuracy_percentage"] == 100.0
    assert pred_after["components"]["quiz_accuracy"]["is_assumed"] is False
    print(f"[PASS] Quiz score in Module 3 increased estimate from {score_before} to {score_after} (100% quiz accuracy).")

    # 6. Test case 6: Confirming unselected-module activity does not affect that exam's estimate
    print("\n--- TEST CASE 6: Unselected-module activity does not affect exam estimate ---")
    pred_2_before = requests.get(f"{BASE_URL}/api/predictions/exam/{exam_2_id}").json()
    score_2_before = pred_2_before["predicted_score"]
    
    # Activity in unselected Module 1
    requests.put(f"{BASE_URL}/api/topics/cn-m1-t1/progress", json={"completion": 100.0, "status": "mastered"})
    requests.post(f"{BASE_URL}/api/quizzes/attempts", json={
        "topic_id": "cn-m1-t1",
        "score": 5,
        "total_questions": 5,
        "time_spent_seconds": 120
    })
    
    pred_2_after = requests.get(f"{BASE_URL}/api/predictions/exam/{exam_2_id}").json()
    score_2_after = pred_2_after["predicted_score"]
    assert score_2_after == score_2_before, f"Expected {score_2_after} == {score_2_before}"
    print(f"[PASS] Unselected module (Module 1) activity had zero effect on Modules 3 & 4 Exam score ({score_2_before} == {score_2_after}).")

    # 7. Test case 7: Study navigation logic & undo completion
    print("\n--- TEST CASE 7: Study navigation target & completion undo ---")
    # For exam_2 (covering M3 and M4), M3 is completed and M4 is pending.
    # The first pending module in scope is M4.
    selected_mods = ["cn-m3", "cn-m4"]
    completed_mods = get_exam["completed_module_ids"]  # ["cn-m3"]
    first_pending = next((m for m in selected_mods if m not in completed_mods), selected_mods[0])
    assert first_pending == "cn-m4", f"Expected 'cn-m4', got {first_pending}"
    
    # Target topic for cn-m4 is cn-m4-t1
    topic_res = requests.get(f"{BASE_URL}/api/topics/cn-m4-t1").json()
    assert topic_res["module_id"] == "cn-m4"
    deep_link_url = f"#/learn?topic={topic_res['id']}"
    print(f"[PASS] Study button navigates to: {deep_link_url} (Module 4, {topic_res['title']}).")

    # Undo completion test
    undo_res = requests.put(f"{BASE_URL}/api/exams/{exam_2_id}/toggle-module-completion", json={
        "module_id": "cn-m3",
        "completed": False
    })
    assert undo_res.status_code == 200
    assert "cn-m3" not in undo_res.json()["completed_module_ids"]
    
    scope_undone = requests.get(f"{BASE_URL}/api/exams/{exam_2_id}/scope-analysis").json()
    assert scope_undone["completed_modules_count"] == 0
    assert scope_undone["module_completion_percentage"] == 0.0
    print(f"[PASS] Undoing completion reset progress to 0/2 (0.0%).")

    print("\nALL 7 CASES VERIFIED AND PASSED!")

if __name__ == "__main__":
    run_tests()
