# Test Case Validation Documentation


## How to Read This Document

Before diving in, here are key terms you'll see throughout:

| Term | What It Means |
|------|--------------|
| **HTTP Status Code** | A number the server sends back to tell you if something worked or failed |
| **201 Created** | "I made the thing you asked for!" |
| **200 OK** | "I found/updated the thing you asked for!" |
| **204 No Content** | "I deleted it successfully, nothing to return" |
| **400 Bad Request** | "Your request is broken or missing something" |
| **401 Unauthorized** | "You're not logged in" |
| **403 Forbidden** | "You're logged in but you don't have permission" |
| **404 Not Found** | "That thing doesn't exist" |
| **409 Conflict** | "Something already exists or creates a conflict" |
| **500 Internal Server Error** | "Something broke on the server side" |
| **Test Data** | The fake data we send to test the API |
| **Expected Result** | What the system SHOULD do when we send that data |

---


## TEST CASE DOCUMENTATION

---

# FEATURE 1: Assignment

## 1.1 Create Assignment

**Endpoint:** `POST /assignments`  
**What it does:** Creates a new assignment inside a section

| Test Case ID | Scenario | Test Data | Expected Result |
|---|---|---|---|
| TC-CA-01 | Valid creation | `{ sectionId: 1, title: "Assignment 1", description: "Desc", dueAt: "2025-12-01", position: 1 }` | Assignment created → **201 Created** |
| TC-CA-02 | Missing title | `{ sectionId: 1, description: "Desc", dueAt: "2025-12-01" }` | Not created → **400 Bad Request** |
| TC-CA-03 | Missing sectionId | `{ title: "Assignment 1", dueAt: "2025-12-01" }` | Not created → **400 Bad Request** |
| TC-CA-04 | Empty request body | `{}` | Not created → **400 Bad Request** |
| TC-CA-05 | Title is wrong type (number instead of string) | `{ sectionId: 1, title: 123, dueAt: "2025-12-01" }` | Not created → **400 Bad Request** |

**Beginner Note:** TC-CA-02 through TC-CA-05 all test **validation** — making sure your API rejects garbage input before trying to save it.

---

## 1.2 Get Assignment by ID

**Endpoint:** `GET /assignments/:id`  
**What it does:** Fetches one specific assignment using its unique ID

| Test Case ID | Scenario | Test Data | Expected Result |
|---|---|---|---|
| TC-GA-01 | Valid ID | `{ id: 1 }` | Assignment data returned → **200 OK** |
| TC-GA-02 | ID does not exist | `{ id: 999 }` | Not found → **404 Not Found** |
| TC-GA-03 | ID is text, not a number | `{ id: "abc" }` | Bad request → **400 Bad Request** |

---

## 1.3 Get Assignments by Section ID

**Endpoint:** `GET /sections/:sectionId/assignments`  
**What it does:** Fetches ALL assignments inside a specific section

| Test Case ID | Scenario | Test Data | Expected Result |
|---|---|---|---|
| TC-GS-01 | Valid section ID | `{ sectionId: 1 }` | List of assignments returned → **200 OK** |
| TC-GS-02 | Section exists but has no assignments | `{ sectionId: 999 }` | Empty list returned → **200 OK** |
| TC-GS-03 | Section ID is text, not a number | `{ sectionId: "abc" }` | Bad request → **400 Bad Request** |

**Beginner Note:** TC-GS-02 returns **200 OK** (not 404) because the request was valid — we just got an empty result. An empty list is still a valid response.

---

## 1.4 Update Assignment by ID

**Endpoint:** `PATCH /assignments/:id`  
**What it does:** Updates one or more fields of an existing assignment

| Test Case ID | Scenario | Test Data | Expected Result |
|---|---|---|---|
| TC-UA-01 | Valid update | `{ id: 1, title: "Updated title" }` | Updated → **200 OK** |
| TC-UA-02 | Assignment does not exist | `{ id: 999, title: "Updated title" }` | Not found → **404 Not Found** |
| TC-UA-03 | ID is text, not a number | `{ id: "abc", title: "Updated title" }` | Bad request → **400 Bad Request** |
| TC-UA-04 | Title is wrong type | `{ id: 1, title: 123 }` | Bad request → **400 Bad Request** |

---

## 1.5 Publish Assignment

**Endpoint:** `POST /assignments/:id/publish`  
**What it does:** Changes an assignment's status from draft to published

| Test Case ID | Scenario | Test Data | Expected Result |
|---|---|---|---|
| TC-PA-01 | Valid publish | `{ id: 1 }` | Published → **200 OK** |
| TC-PA-02 | Assignment does not exist | `{ id: 999 }` | Not found → **404 Not Found** |
| TC-PA-03 | ID is text, not a number | `{ id: "abc" }` | Bad request → **400 Bad Request** |

---

## 1.6 Delete Assignment by ID

**Endpoint:** `DELETE /assignments/:id`  
**What it does:** Permanently deletes an assignment

| Test Case ID | Scenario | Test Data | Expected Result |
|---|---|---|---|
| TC-DA-01 | Valid delete | `{ id: 1 }` | Deleted → **204 No Content** |
| TC-DA-02 | Assignment does not exist | `{ id: 999 }` | Not found → **404 Not Found** |
| TC-DA-03 | ID is text, not a number | `{ id: "abc" }` | Bad request → **400 Bad Request** |

---

# FEATURE 2: Member

## 2.1 Add Member

**Endpoint:** `POST /classrooms/:classroomId/members`  
**What it does:** Adds a user to a classroom (only admins can do this)

| Test Case ID | Scenario | Test Data | Expected Result |
|---|---|---|---|
| TC-S-AM-01 | Admin adds member successfully | `{ classroomId:1, requesterId:10, userId:20, role:"STUDENT" }` | Member added → **201 Created** |
| TC-S-AM-02 | Classroom does not exist | `{ classroomId:999, requesterId:10, userId:20, role:"STUDENT" }` | Not found → **404 Not Found** |
| TC-S-AM-03 | Requester is not an admin | `{ classroomId:1, requesterId:20, userId:30, role:"STUDENT" }` | Forbidden → **403 Forbidden** |
| TC-S-AM-04 | User is already a member | `{ classroomId:1, requesterId:10, userId:20, role:"STUDENT" }` | Conflict → **409 Conflict** |
| TC-S-AM-05 | [UNIT TEST] addMember() repository method is called | Valid admin request | addMember() is invoked internally |

> **TC-S-AM-05 Note:** This is a unit test — it belongs in your service/repository test file, not in your API integration test suite.

---

## 2.2 Remove Member

**Endpoint:** `DELETE /classrooms/:classroomId/members/:userId`  
**What it does:** Removes a user from a classroom (only admins can do this)

| Test Case ID | Scenario | Test Data | Expected Result |
|---|---|---|---|
| TC-S-RM-01 | Admin removes member successfully | `{ classroomId:1, requesterId:10, userId:20 }` | Removed → **204 No Content** |
| TC-S-RM-02 | Classroom does not exist | `{ classroomId:999, requesterId:10, userId:20 }` | Not found → **404 Not Found** |
| TC-S-RM-03 | Requester is not an admin | `{ classroomId:1, requesterId:20, userId:30 }` | Forbidden → **403 Forbidden** |
| TC-S-RM-04 | Admin tries to remove themselves | `{ classroomId:1, requesterId:10, userId:10 }` | Conflict → **409 Conflict** |
| TC-S-RM-05 | Target user is not a member | `{ classroomId:1, requesterId:10, userId:999 }` | Not found → **404 Not Found** |
| TC-S-RM-06 | [UNIT TEST] removeMember() is called | Valid admin request | removeMember() is invoked internally |

> **TC-S-RM-06 Note:** Unit test — belongs in service test file.

---

## 2.3 Change Member Role

**Endpoint:** `PATCH /classrooms/:classroomId/members/:userId/role`  
**What it does:** Changes a member's role (e.g., STUDENT to ADMIN)

| Test Case ID | Scenario | Test Data | Expected Result |
|---|---|---|---|
| TC-S-CMR-01 | Admin changes role successfully | `{ classroomId:1, requesterId:10, userId:20, role:"ADMIN" }` | Updated → **200 OK** |
| TC-S-CMR-02 | Classroom does not exist | `{ classroomId:999, requesterId:10, userId:20, role:"ADMIN" }` | Not found → **404 Not Found** |
| TC-S-CMR-03 | Requester is not an admin | `{ classroomId:1, requesterId:20, userId:30, role:"ADMIN" }` | Forbidden → **403 Forbidden** |
| TC-S-CMR-04 | Target member does not exist | `{ classroomId:1, requesterId:10, userId:999, role:"ADMIN" }` | Not found → **404 Not Found** |
| TC-S-CMR-05 | Role is already the same | `{ classroomId:1, requesterId:10, userId:20, role:"STUDENT" }` (user is already STUDENT) | Conflict → **409 Conflict** |
| TC-S-CMR-06 | [UNIT TEST] updateRole() is called | Valid admin request | updateRole() is invoked internally |

> **TC-S-CMR-06 Note:** Unit test — belongs in service test file.

---

## 2.4 List Members

**Endpoint:** `GET /classrooms/:classroomId/members`  
**What it does:** Returns all members of a classroom

| Test Case ID | Scenario | Test Data | Expected Result |
|---|---|---|---|
| TC-S-LM-01 | Valid classroom | `{ classroomId: 1 }` | Member list returned → **200 OK** |
| TC-S-LM-02 | Classroom does not exist | `{ classroomId: 999 }` | Not found → **404 Not Found** |

---

## 2.5 Get Single Member

**Endpoint:** `GET /classrooms/:classroomId/members/:userId`  
**What it does:** Returns details for one specific member in a classroom

| Test Case ID | Scenario | Test Data | Expected Result |
|---|---|---|---|
| TC-S-GM-01 | Valid classroom and user | `{ classroomId: 1, userId: 20 }` | Member details returned → **200 OK** |
| TC-S-GM-02 | Classroom does not exist | `{ classroomId: 999, userId: 20 }` | Not found → **404 Not Found** |
| TC-S-GM-03 | User is not a member | `{ classroomId: 1, userId: 999 }` | Not found → **404 Not Found** |

---

# FEATURE 3: Classroom CRUD

## 3.1 Create Classroom

**Endpoint:** `POST /classrooms`  
**What it does:** Creates a new classroom

| Test Case ID | Scenario | Test Data | Expected Result |
|---|---|---|---|
| TC-CC-01 | Valid creation with name and description | `{ name: "Math", description: "Basic math" }` | Created → **201 Created** |
| TC-CC-02 | Valid creation with name only (description optional) | `{ name: "Math" }` | Created → **201 Created** |
| TC-CC-03 | Missing name | `{ description: "Basic math" }` | Not created → **400 Bad Request** |
| TC-CC-04 | Empty body | `{}` | Not created → **400 Bad Request** |
| TC-CC-05 | Name is wrong type (number) | `{ name: 123 }` | Not created → **400 Bad Request** |

---

## 3.2 Get Classroom by Class Code

**Endpoint:** `GET /classrooms?classCode=MTH01`  
**What it does:** Finds a classroom using its unique class code

| Test Case ID | Scenario | Test Data | Expected Result |
|---|---|---|---|
| TC-GC-01 | Valid class code | `{ classCode: "MTH01" }` | Classroom returned → **200 OK** |
| TC-GC-02 | Class code does not exist | `{ classCode: "XXX99" }` | Not found → **404 Not Found** |
| TC-GC-03 | Empty class code | `{ classCode: "" }` | Bad request → **400 Bad Request** |

---

## 3.3 Get Classroom by ID

**Endpoint:** `GET /classrooms/:id`  
**What it does:** Fetches classroom details using its numeric ID

| Test Case ID | Scenario | Test Data | Expected Result | Notes |
|---|---|---|---|---|
| TC-GI-01 | Valid ID | `{ id: 1 }` | Classroom returned → **200 OK** | |
| TC-GI-02 | ID is text, not a number | `{ id: "abc" }` | Bad request → **400 Bad Request** | Fixed from original 500 |
| TC-GI-03 | ID does not exist | `{ id: 999 }` | Not found → **404 Not Found** | |

---

## 3.4 Update Classroom by ID

**Endpoint:** `PATCH /classrooms/:id`  
**What it does:** Updates classroom name or description

| Test Case ID | Scenario | Test Data | Expected Result |
|---|---|---|---|
| TC-UI-01 | Valid update | `{ id: 1, name: "New Math" }` | Updated → **200 OK** |
| TC-UI-02 | ID is text, not a number | `{ id: "abc", name: "New Math" }` | Bad request → **400 Bad Request** |
| TC-UI-03 | ID does not exist | `{ id: 999, name: "New Math" }` | Not found → **404 Not Found** |
| TC-UI-04 | Name is empty string | `{ id: 1, name: "" }` | Bad request → **400 Bad Request** |

---

## 3.5 Delete Classroom by ID

**Endpoint:** `DELETE /classrooms/:id`  
**What it does:** Permanently deletes a classroom

| Test Case ID | Scenario | Test Data | Expected Result |
|---|---|---|---|
| TC-DI-01 | Valid delete | `{ id: 1 }` | Deleted → **204 No Content** |
| TC-DI-02 | ID is text, not a number | `{ id: "abc" }` | Bad request → **400 Bad Request** |
| TC-DI-03 | ID does not exist | `{ id: 999 }` | Not found → **404 Not Found** |

---

# FEATURE 4: Classroom View (Access Control)

**User Story:** Users should only see classrooms they own or belong to

## 4.1 View Classroom List

**Endpoint:** `GET /classrooms` (with user authentication)

| Test Case ID | Scenario | Test Data | Expected Result |
|---|---|---|---|
| TC-CL-01 | User sees their owned classrooms | UserID=10 owns Class A | Class A appears in list → **200 OK** |
| TC-CL-02 | User sees classrooms they joined | UserID=10 is member of Class B | Class B appears in list → **200 OK** |
| TC-CL-03 | User sees both owned and joined classrooms | UserID=10 owns A, member of B | Both A and B appear → **200 OK** |
| TC-CL-04 | User with no classrooms gets empty list | UserID=10 has no classrooms | Empty list returned → **200 OK** |
| TC-CL-05 | User cannot see classrooms they do not belong to | UserID=10 not in Class C | Class C does NOT appear in results → **200 OK** |

---

## 4.2 Unauthorized Access Blocked

| Test Case ID | Scenario | Test Data | Expected Result |
|---|---|---|---|
| TC-CL-06 | User tries to access a classroom they are not in | UserID=10 tries to access Class C | Access denied → **403 Forbidden** |
| TC-CL-07 | Direct URL access without authorization | GET /classrooms/3 (no token or not a member) | Blocked → **403 Forbidden** |

---

# FEATURE 5: CRUD Challenges

## 5.1 Create Challenge

**Endpoint:** `POST /challenges`

| Test Case ID | Scenario | Test Data | Expected Result |
|---|---|---|---|
| TC-CH-C-01 | Valid challenge creation | `{ title:"Loops", description:"Solve loops" }` | Created → **201 Created** |
| TC-CH-C-02 | Missing title | `{ description:"Problem" }` | Validation error → **400 Bad Request** |
| TC-CH-C-03 | Missing description | `{ title:"Loops" }` | Validation error → **400 Bad Request** |
| TC-CH-C-04 | Empty body | `{}` | Validation error → **400 Bad Request** |
| TC-CH-C-05 | Title is wrong type (number) | `{ title:123 }` | Validation error → **400 Bad Request** |
| TC-CH-C-06 | Description is wrong type (number) | `{ description:999 }` | Validation error → **400 Bad Request** |
| TC-CH-C-07 | Title exceeds max length | `{ title: "A".repeat(300) }` | Validation error → **400 Bad Request** |
| TC-CH-C-08 | Duplicate title already exists | `{ title:"Loops" }` (Loops already in DB) | Conflict → **409 Conflict** |

---

## 5.2 Read Challenge

**Endpoint:** `GET /challenges/:id` and `GET /challenges`

| Test Case ID | Scenario | Test Data | Expected Result |
|---|---|---|---|
| TC-CH-R-01 | Valid ID | `{ id: 1 }` | Challenge data returned → **200 OK** |
| TC-CH-R-02 | ID does not exist | `{ id: 999 }` | Not found → **404 Not Found** |
| TC-CH-R-03 | ID is text | `{ id: "abc" }` | Bad request → **400 Bad Request** |
| TC-CH-R-04 | ID is zero | `{ id: 0 }` | Bad request → **400 Bad Request** |
| TC-CH-R-05 | ID is negative | `{ id: -5 }` | Bad request → **400 Bad Request** |
| TC-CH-R-06 | List all challenges | GET /challenges | Challenge list returned → **200 OK** |
| TC-CH-R-07 | List when no challenges exist | GET /challenges (empty DB) | Empty list returned → **200 OK** |

---

## 5.3 Update Challenge

**Endpoint:** `PATCH /challenges/:id`

| Test Case ID | Scenario | Test Data | Expected Result |
|---|---|---|---|
| TC-CH-U-01 | Update title only | `{ title:"Updated Title" }` | Updated → **200 OK** |
| TC-CH-U-02 | Update description only | `{ description:"New desc" }` | Updated → **200 OK** |
| TC-CH-U-03 | Challenge does not exist | `{ id: 999, title:"Updated" }` | Not found → **404 Not Found** |
| TC-CH-U-04 | Wrong data type for title | `{ title:555 }` | Validation error → **400 Bad Request** |
| TC-CH-U-05 | Empty body | `{}` | Validation error → **400 Bad Request** |
| TC-CH-U-06 | Update causes duplicate title | `{ title:"Loops" }` (already exists) | Conflict → **409 Conflict** |

---

## 5.4 Delete Challenge

**Endpoint:** `DELETE /challenges/:id`

| Test Case ID | Scenario | Test Data | Expected Result |
|---|---|---|---|
| TC-CH-D-01 | Valid delete | `{ id: 1 }` | Deleted → **204 No Content** |
| TC-CH-D-02 | Challenge does not exist | `{ id: 999 }` | Not found → **404 Not Found** |
| TC-CH-D-03 | ID is text | `{ id: "abc" }` | Bad request → **400 Bad Request** |
| TC-CH-D-04 | No auth token | No Authorization header | Unauthorized → **401 Unauthorized** |
| TC-CH-D-05 | Student tries to delete | Token of a STUDENT user | Forbidden → **403 Forbidden** |
| TC-CH-D-06 | Challenge has test cases attached | Challenge with child test cases | Team must choose one expected result — see note below |

> **TC-CH-D-06 Note (Bug Fixed):** You must choose ONE behavior:
> - **Option A (Strict):** Block deletion → return `409 Conflict`
> - **Option B (Cascade):** Auto-delete children too → return `204 No Content`
>
> Document your decision and make the test reflect exactly one expected result.

---

# FEATURE 6: CRUD Test Cases (for Challenges)

## 6.1 Create Challenge Test Case

**Endpoint:** `POST /challenges/:challengeId/testcases`

| Test Case ID | Scenario | Test Data | Expected Result |
|---|---|---|---|
| TC-TC-C-01 | Valid creation | `{ challengeId:1, input:"2", output:"4" }` | Created → **201 Created** |
| TC-TC-C-02 | Missing input field | `{ challengeId:1, output:"4" }` | Validation error → **400 Bad Request** |
| TC-TC-C-03 | Missing output field | `{ challengeId:1, input:"2" }` | Validation error → **400 Bad Request** |
| TC-TC-C-04 | Missing challengeId | `{ input:"2", output:"4" }` | Validation error → **400 Bad Request** |
| TC-TC-C-05 | Challenge does not exist | `{ challengeId:999, input:"2", output:"4" }` | Not found → **404 Not Found** |
| TC-TC-C-06 | Input is wrong type (number) | `{ challengeId:1, input:123, output:"4" }` | Validation error → **400 Bad Request** |
| TC-TC-C-07 | Duplicate test case | Same input and output already exists for challenge | Conflict → **409 Conflict** |
| TC-TC-C-08 | No auth token | No Authorization header | Unauthorized → **401 Unauthorized** |
| TC-TC-C-09 | Student tries to add test case | Token of a STUDENT user | Forbidden → **403 Forbidden** |

---

## 6.2 Read Challenge Test Cases

**Endpoint:** `GET /challenges/:challengeId/testcases`

| Test Case ID | Scenario | Test Data | Expected Result |
|---|---|---|---|
| TC-TC-R-01 | Valid challenge with test cases | challengeId: 1 | List returned → **200 OK** |
| TC-TC-R-02 | Challenge exists but has no test cases | challengeId: 2 (empty) | Empty list returned → **200 OK** |
| TC-TC-R-03 | Challenge does not exist | challengeId: 999 | Not found → **404 Not Found** |
| TC-TC-R-04 | No auth token | No Authorization header | Unauthorized → **401 Unauthorized** |

---

## 6.3 Update Challenge Test Case

**Endpoint:** `PATCH /challenges/:challengeId/testcases/:id`

| Test Case ID | Scenario | Test Data | Expected Result |
|---|---|---|---|
| TC-TC-U-01 | Update output only | `{ id:1, output:"8" }` | Updated → **200 OK** |
| TC-TC-U-02 | Update input only | `{ id:1, input:"5" }` | Updated → **200 OK** |
| TC-TC-U-08 | Update both input and output | `{ id:1, input:"5", output:"8" }` | Updated → **200 OK** |
| TC-TC-U-03 | Test case does not exist | `{ id:999, output:"8" }` | Not found → **404 Not Found** |
| TC-TC-U-04 | Wrong data type for output | `{ output:123 }` | Validation error → **400 Bad Request** |
| TC-TC-U-07 | Update creates duplicate test case | Same input and output already exists | Conflict → **409 Conflict** |
| TC-TC-U-05 | No auth token | No Authorization header | Unauthorized → **401 Unauthorized** |
| TC-TC-U-06 | Student tries to update | Token of a STUDENT user | Forbidden → **403 Forbidden** |

---

## 6.4 Delete Challenge Test Case

**Endpoint:** `DELETE /challenges/:challengeId/testcases/:id`

| Test Case ID | Scenario | Test Data | Expected Result |
|---|---|---|---|
| TC-TC-D-01 | Valid delete | `{ id: 1 }` | Deleted → **204 No Content** |
| TC-TC-D-02 | Test case does not exist | `{ id: 999 }` | Not found → **404 Not Found** |
| TC-TC-D-03 | ID is text | `{ id: "abc" }` | Bad request → **400 Bad Request** |
| TC-TC-D-04 | No auth token | No Authorization header | Unauthorized → **401 Unauthorized** |
| TC-TC-D-05 | Student tries to delete | Token of a STUDENT user | Forbidden → **403 Forbidden** |


---

# FEATURE 7: Code Runner API

## 7.1 Execute Code

**Endpoint:** `POST /code-runner/run`  
**What it does:** Compiles and runs submitted source code, optionally evaluating it against test cases

| Test Case ID | Scenario | Test Data | Expected Result |
|---|---|---|---|
| TC-CR-01 | Valid C code with no test cases | `{ sourceCode: "#include <stdio.h>\nint main(){ printf(\"Hello\"); return 0; }", language: "C" }` | Output: "Hello", testResults: [] → **200 OK** |
| TC-CR-02 | Valid C code with a passing test case | `{ sourceCode: "...echo int...", language: "C", testCases: [{ input: "5", expectedOutput: "5" }] }` | testResults[0].status is "PASS" → **200 OK** |
| TC-CR-03 | Valid C code with a failing test case | Code prints "6" but expected output is "5" | testResults[0] contains expected: "5", actual: "6", status: "FAIL" → **200 OK** |
| TC-CR-04 | Empty sourceCode field | `{ sourceCode: "", language: "C" }` | Validation error: "sourceCode cannot be empty" → **400 Bad Request** |
| TC-CR-05 | Unsupported language submitted | `{ sourceCode: "print('Hello')", language: "Python" }` | Validation error: "Unsupported language" → **400 Bad Request** |
| TC-CR-06 | Missing required language field | `{ sourceCode: "int main(){}" }` | Validation error: "language is required" → **400 Bad Request** |
| TC-CR-07 | Source code contains a compilation error | `{ sourceCode: "int main(){ printf(\"Hello\") }", language: "C" }` | Response contains compiler error log → **422 Unprocessable Entity** |
| TC-CR-08 | Source code contains an infinite loop | `{ sourceCode: "int main(){ while(1); }", language: "C" }` | Error: "Execution timeout" → **408 Request Timeout** |
| TC-CR-09 | Source code payload exceeds 10 MB | Very large sourceCode string (10 MB or more) | Request rejected → **413 Payload Too Large** |
| TC-CR-10 | Code produces massive console output | Code printing inside a very large loop | Output is truncated safely, system remains stable → **200 OK** |
| TC-CR-11 | Malicious OS command injection via system() | `{ sourceCode: "#include<stdlib.h>\nint main(){ system(\"rm -rf /\"); return 0; }", language: "C" }` | Execution blocked by sandbox → **403 Forbidden** |
| TC-CR-12 | Attempt to read local file system | Code using fopen to open /etc/passwd | File access denied by sandbox → **403 Forbidden** |
| TC-CR-13 | Fork bomb or memory exhaustion attempt | Code repeatedly calling fork() | Process terminated safely → **403 Forbidden** |
| TC-CR-14 | 100 concurrent valid submissions | 100 valid execution requests sent simultaneously | All requests return 200 OK, no 500 errors, average response under 3 seconds → **200 OK** |
| TC-CR-15 | Sustained load at 50 requests per second for 10 minutes | Continuous load scenario | Stable memory usage, no crashes, all valid requests return 200 OK → **200 OK** |

---
