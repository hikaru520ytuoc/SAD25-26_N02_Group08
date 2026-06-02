# Test Cases - Sprint 2

| ID | Scenario | Expected result |
|---|---|---|
| TC-PERIOD-01 | FACULTY_MANAGER creates project period | 201/200 success and audit log PROJECT_PERIOD_CREATED |
| TC-PERIOD-02 | STUDENT creates project period | 403 Forbidden |
| TC-PERIOD-03 | startDate > endDate | 400 PROJECT_PERIOD_INVALID_DATE |
| TC-PERIOD-04 | FACULTY_MANAGER opens period | Status becomes OPEN |
| TC-PERIOD-05 | FACULTY_MANAGER closes period | Status becomes CLOSED |
| TC-ELIG-01 | FACULTY_MANAGER adds eligible student with COMPLETED internship | Eligibility becomes ELIGIBLE |
| TC-ELIG-02 | Non-existing studentId | 404 STUDENT_NOT_FOUND |
| TC-ELIG-03 | Non-existing projectPeriodId | 404 PROJECT_PERIOD_NOT_FOUND |
| TC-ELIG-04 | NOT_COMPLETED + ELIGIBLE | 400 STUDENT_NOT_INTERNSHIP_COMPLETED |
| TC-ELIG-05 | Duplicate student/period eligibility | 409 STUDENT_ELIGIBILITY_EXISTS |
| TC-ELIG-06 | STUDENT checks /api/student-eligibilities/me | Returns only own records |
| TC-TOPIC-01 | SUPERVISOR creates topic | Topic status DRAFT |
| TC-TOPIC-02 | STUDENT creates topic | 403 Forbidden |
| TC-TOPIC-03 | SUPERVISOR submits own draft topic | Topic status SUBMITTED |
| TC-TOPIC-04 | FACULTY_MANAGER approves SUBMITTED topic | Topic status APPROVED |
| TC-TOPIC-05 | Reject topic without reason | 400 validation error |
| TC-TOPIC-06 | Publish topic not APPROVED | 409 TOPIC_INVALID_STATUS |
| TC-TOPIC-07 | Publish APPROVED topic | Topic status PUBLISHED |
| TC-TOPIC-08 | STUDENT lists published topics | Only PUBLISHED topics returned |
| TC-TOPIC-09 | SUPERVISOR edits another lecturer topic | 403 TOPIC_FORBIDDEN_ACTION |
| TC-AUDIT-01 | Create period, eligibility, topic, approve/publish topic | Corresponding audit logs are created |
