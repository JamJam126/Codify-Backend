# Test Cases - Validation Documentation

## How to Read Each Test Case

Each test case follows this structure:

| Test Case Field | Details |
|---|---|
| Test Case ID: Test Case Name | Unique ID and a plain-English name describing the scenario |
| Purpose | Why this test exists - what user behavior or system rule it verifies |
| Initiation Criteria | The starting state the system must be in before the test is executed |
| Execution Steps | Step-by-step actions taken to run the test |
| Expected Results | What the system must return or do for the test to pass |

---

## TEST CASE DOCUMENTATION

---

# FEATURE 1: Assignment

**User Story:** As a teacher, I want to create, read, update, and delete assignments so that students can receive and complete learning tasks.

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-CA-01: Teacher creates a new assignment for a section |
| **Purpose** | Verify that a teacher can successfully create an assignment with all required fields provided. |
| **Initiation Criteria** | A classroom and section exist. The teacher is a member of the classroom with the TEACHER role. A valid authentication token is available. |
| **Execution Steps** | 1. Send a POST request to `/sections/{sectionId}/assignments`.<br>2. Provide title, description, dueAt, and position in the request body.<br>3. Include a valid authentication token in the request header. |
| **Expected Results** | Assignment is created successfully. System returns 201 Created with the new assignment data. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-CA-02: Teacher attempts to create an assignment without providing a title |
| **Purpose** | Verify that the system rejects assignment creation when the required title field is missing. |
| **Initiation Criteria** | A classroom and section exist. A valid authentication token is available. |
| **Execution Steps** | 1. Send a POST request to `/sections/{sectionId}/assignments`.<br>2. Provide dueAt and position in the request body but omit the title field.<br>3. Include a valid authentication token in the request header. |
| **Expected Results** | Assignment is not created. System returns 400 Bad Request with a validation message indicating that title is required. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-CA-03: Teacher attempts to create an assignment without providing a sectionId |
| **Purpose** | Verify that the system rejects assignment creation when the required sectionId is missing from the request path. |
| **Initiation Criteria** | The teacher is authenticated. A valid authentication token is available. |
| **Execution Steps** | 1. Send a POST request to `/assignments` without a sectionId in the path.<br>2. Provide title and dueAt in the request body.<br>3. Include a valid authentication token in the request header. |
| **Expected Results** | Assignment is not created. System returns 400 Bad Request with a validation message indicating that sectionId is required. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-CA-04: Teacher submits an empty request body to the assignment creation endpoint |
| **Purpose** | Verify that the system rejects completely empty requests and does not create any record. |
| **Initiation Criteria** | A classroom and section exist. A valid authentication token is available. |
| **Execution Steps** | 1. Send a POST request to `/sections/{sectionId}/assignments`.<br>2. Provide an empty JSON body `{}`.<br>3. Include a valid authentication token in the request header. |
| **Expected Results** | Assignment is not created. System returns 400 Bad Request. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-CA-05: Teacher submits a number instead of text for the assignment title |
| **Purpose** | Verify that the system enforces correct data types and rejects invalid input for the title field. |
| **Initiation Criteria** | A classroom and section exist. A valid authentication token is available. |
| **Execution Steps** | 1. Send a POST request to `/sections/{sectionId}/assignments`.<br>2. Provide a number (e.g. 123) as the title value instead of a string, along with a valid dueAt.<br>3. Include a valid authentication token in the request header. |
| **Expected Results** | Assignment is not created. System returns 400 Bad Request with a type validation error. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-GA-01: Teacher retrieves an existing assignment by its ID |
| **Purpose** | Verify that a teacher can fetch full assignment details using a valid assignment ID. |
| **Initiation Criteria** | An assignment with a known ID exists. A valid authentication token is available. |
| **Execution Steps** | 1. Send a GET request to `/assignments/{assignmentId}` using a known valid assignment ID.<br>2. Include a valid authentication token in the request header. |
| **Expected Results** | Assignment details are returned. System returns 200 OK with the assignment data. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-GA-02: Teacher tries to retrieve an assignment that does not exist |
| **Purpose** | Verify that the system returns a clear not-found response when the requested assignment ID does not exist. |
| **Initiation Criteria** | No assignment with ID 999 exists. A valid authentication token is available. |
| **Execution Steps** | 1. Send a GET request to `/assignments/999`.<br>2. Include a valid authentication token in the request header. |
| **Expected Results** | No data is returned. System returns 404 Not Found. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-GA-03: Teacher submits a non-numeric value as the assignment ID |
| **Purpose** | Verify that the system rejects requests where the assignment ID is not a valid number. |
| **Initiation Criteria** | A valid authentication token is available. |
| **Execution Steps** | 1. Send a GET request to `/assignments/abc`.<br>2. Include a valid authentication token in the request header. |
| **Expected Results** | Request is rejected. System returns 400 Bad Request. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-GS-01: Teacher views all assignments for a specific section |
| **Purpose** | Verify that a teacher can retrieve the full list of assignments belonging to a section. |
| **Initiation Criteria** | A section with a known ID exists and has at least one assignment. A valid authentication token is available. |
| **Execution Steps** | 1. Send a GET request to `/sections/{sectionId}/assignments` using a valid section ID.<br>2. Include a valid authentication token in the request header. |
| **Expected Results** | A list of assignments is returned. System returns 200 OK. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-GS-02: Teacher views assignments for a section that has none |
| **Purpose** | Verify that the system returns an empty list rather than an error when a section exists but has no assignments. |
| **Initiation Criteria** | A valid section exists but has no assignments attached. A valid authentication token is available. |
| **Execution Steps** | 1. Send a GET request to `/sections/{sectionId}/assignments` using the ID of a section with no assignments.<br>2. Include a valid authentication token in the request header. |
| **Expected Results** | An empty list is returned. System returns 200 OK. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-GS-03: Teacher submits a non-numeric value as the section ID |
| **Purpose** | Verify that the system rejects requests where the sectionId is not a valid number. |
| **Initiation Criteria** | A valid authentication token is available. |
| **Execution Steps** | 1. Send a GET request to `/sections/abc/assignments`.<br>2. Include a valid authentication token in the request header. |
| **Expected Results** | Request is rejected. System returns 400 Bad Request. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-UA-01: Teacher updates the title of an existing assignment |
| **Purpose** | Verify that a teacher can successfully update an assignment's title using a valid assignment ID. |
| **Initiation Criteria** | An assignment with a known ID exists. The teacher owns the classroom. A valid authentication token is available. |
| **Execution Steps** | 1. Send a PATCH request to `/assignments/{assignmentId}`.<br>2. Provide the new title string in the request body.<br>3. Include a valid authentication token in the request header. |
| **Expected Results** | Assignment is updated successfully. System returns 200 OK with the updated assignment data. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-UA-02: Teacher tries to update an assignment that does not exist |
| **Purpose** | Verify that the system returns a not-found response when attempting to update a non-existent assignment. |
| **Initiation Criteria** | No assignment with ID 999 exists. A valid authentication token is available. |
| **Execution Steps** | 1. Send a PATCH request to `/assignments/999`.<br>2. Provide a new title string in the request body.<br>3. Include a valid authentication token in the request header. |
| **Expected Results** | Update is rejected. System returns 404 Not Found. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-UA-03: Teacher submits a non-numeric value as the assignment ID when updating |
| **Purpose** | Verify that the system rejects update requests where the assignment ID is not a valid number. |
| **Initiation Criteria** | A valid authentication token is available. |
| **Execution Steps** | 1. Send a PATCH request to `/assignments/abc`.<br>2. Provide a new title in the request body.<br>3. Include a valid authentication token in the request header. |
| **Expected Results** | Request is rejected. System returns 400 Bad Request. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-UA-04: Teacher submits a number instead of text for the updated title |
| **Purpose** | Verify that the system enforces correct data types when updating the title field. |
| **Initiation Criteria** | An assignment with a known ID exists. A valid authentication token is available. |
| **Execution Steps** | 1. Send a PATCH request to `/assignments/{assignmentId}`.<br>2. Provide a number (e.g. 123) as the title value in the request body.<br>3. Include a valid authentication token in the request header. |
| **Expected Results** | Update is rejected. System returns 400 Bad Request. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-PA-01: Teacher publishes a draft assignment |
| **Purpose** | Verify that a teacher can successfully publish an assignment, making it visible to students. |
| **Initiation Criteria** | An assignment with a known ID exists in draft status. A valid authentication token is available. |
| **Execution Steps** | 1. Send a POST request to `/assignments/{assignmentId}/publish`.<br>2. Include a valid authentication token in the request header. |
| **Expected Results** | Assignment status changes to published. System returns 200 OK. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-PA-02: Teacher tries to publish an assignment that does not exist |
| **Purpose** | Verify that the system returns a not-found response when attempting to publish a non-existent assignment. |
| **Initiation Criteria** | No assignment with ID 999 exists. A valid authentication token is available. |
| **Execution Steps** | 1. Send a POST request to `/assignments/999/publish`.<br>2. Include a valid authentication token in the request header. |
| **Expected Results** | Publish action is rejected. System returns 404 Not Found. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-PA-03: Teacher submits a non-numeric assignment ID when publishing |
| **Purpose** | Verify that the system rejects publish requests with an invalid ID format. |
| **Initiation Criteria** | A valid authentication token is available. |
| **Execution Steps** | 1. Send a POST request to `/assignments/abc/publish`.<br>2. Include a valid authentication token in the request header. |
| **Expected Results** | Request is rejected. System returns 400 Bad Request. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-DA-01: Teacher deletes an existing assignment |
| **Purpose** | Verify that a teacher can permanently delete an assignment that exists in the system. |
| **Initiation Criteria** | An assignment with a known ID exists. The teacher owns the classroom. A valid authentication token is available. |
| **Execution Steps** | 1. Send a DELETE request to `/assignments/{assignmentId}`.<br>2. Include a valid authentication token in the request header. |
| **Expected Results** | Assignment is permanently deleted. System returns 204 No Content. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-DA-02: Teacher tries to delete an assignment that does not exist |
| **Purpose** | Verify that the system returns a not-found response when attempting to delete a non-existent assignment. |
| **Initiation Criteria** | No assignment with ID 999 exists. A valid authentication token is available. |
| **Execution Steps** | 1. Send a DELETE request to `/assignments/999`.<br>2. Include a valid authentication token in the request header. |
| **Expected Results** | Deletion is rejected. System returns 404 Not Found. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-DA-03: Teacher submits a non-numeric assignment ID when deleting |
| **Purpose** | Verify that the system rejects delete requests with an invalid ID format. |
| **Initiation Criteria** | A valid authentication token is available. |
| **Execution Steps** | 1. Send a DELETE request to `/assignments/abc`.<br>2. Include a valid authentication token in the request header. |
| **Expected Results** | Request is rejected. System returns 400 Bad Request. |

---

# FEATURE 2: Member Management

**User Story:** As a classroom admin, I want to add, remove, and manage the roles of classroom members so that only authorized users can access and participate in the classroom.

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-S-AM-01: Admin adds a new student to a classroom |
| **Purpose** | Verify that an admin can successfully add a user as a member of a classroom. |
| **Initiation Criteria** | Classroom with a known ID exists. The requesting user is an admin of that classroom. The user being added is not yet a member. A valid authentication token is available. |
| **Execution Steps** | 1. Send a POST request to `/classrooms/{classroomId}/members`.<br>2. Provide userId and role "STUDENT" in the request body.<br>3. Include a valid authentication token in the request header. |
| **Expected Results** | User is added as a member. System returns 201 Created. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-S-AM-02: Admin tries to add a member to a classroom that does not exist |
| **Purpose** | Verify that the system prevents adding a member to a non-existent classroom. |
| **Initiation Criteria** | No classroom with ID 999 exists. A valid authentication token is available. |
| **Execution Steps** | 1. Send a POST request to `/classrooms/999/members`.<br>2. Provide userId and role in the request body.<br>3. Include a valid authentication token in the request header. |
| **Expected Results** | Member is not added. System returns 404 Not Found. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-S-AM-03: Non-admin user attempts to add a member to a classroom |
| **Purpose** | Verify that only admins can add members and that students cannot perform this action. |
| **Initiation Criteria** | Classroom with a known ID exists. The requesting user is a STUDENT in that classroom. A valid authentication token for the student is available. |
| **Execution Steps** | 1. Send a POST request to `/classrooms/{classroomId}/members` using the student's authentication token.<br>2. Provide a new userId and role in the request body.<br>3. Include the student's authentication token in the request header. |
| **Expected Results** | Member is not added. System returns 403 Forbidden. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-S-AM-04: Admin tries to add a user who is already a member of the classroom |
| **Purpose** | Verify that the system prevents duplicate membership records for the same user in the same classroom. |
| **Initiation Criteria** | Classroom with a known ID exists. The target user is already a member. A valid admin authentication token is available. |
| **Execution Steps** | 1. Send a POST request to `/classrooms/{classroomId}/members`.<br>2. Provide the ID of an existing member in the userId field of the request body.<br>3. Include a valid admin authentication token in the request header. |
| **Expected Results** | Member is not added again. System returns 409 Conflict. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-S-RM-01: Admin removes a student from a classroom |
| **Purpose** | Verify that an admin can successfully remove an existing member from a classroom. |
| **Initiation Criteria** | Classroom with a known ID exists. The target user is a member. A valid admin authentication token is available. |
| **Execution Steps** | 1. Send a DELETE request to `/classrooms/{classroomId}/members/{userId}`.<br>2. Include a valid admin authentication token in the request header. |
| **Expected Results** | Member is removed from the classroom. System returns 204 No Content. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-S-RM-02: Admin tries to remove a member from a classroom that does not exist |
| **Purpose** | Verify that the system returns a not-found response when the target classroom does not exist. |
| **Initiation Criteria** | No classroom with ID 999 exists. A valid admin authentication token is available. |
| **Execution Steps** | 1. Send a DELETE request to `/classrooms/999/members/{userId}`.<br>2. Include a valid admin authentication token in the request header. |
| **Expected Results** | Deletion is rejected. System returns 404 Not Found. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-S-RM-03: Non-admin user attempts to remove a member from a classroom |
| **Purpose** | Verify that students cannot remove members from a classroom. |
| **Initiation Criteria** | Classroom with a known ID exists. The requesting user is a STUDENT. A valid student authentication token is available. |
| **Execution Steps** | 1. Send a DELETE request to `/classrooms/{classroomId}/members/{userId}` using the student's token.<br>2. Include the student's authentication token in the request header. |
| **Expected Results** | Deletion is rejected. System returns 403 Forbidden. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-S-RM-04: Admin attempts to remove themselves from the classroom |
| **Purpose** | Verify that an admin cannot remove their own membership, which would leave the classroom without an admin. |
| **Initiation Criteria** | Classroom with a known ID exists. The requesting user is an admin of that classroom. A valid admin authentication token is available. |
| **Execution Steps** | 1. Send a DELETE request to `/classrooms/{classroomId}/members/{adminUserId}` where the target userId is the same as the requesting admin's own user ID.<br>2. Include a valid admin authentication token in the request header. |
| **Expected Results** | Deletion is rejected. System returns 409 Conflict. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-S-RM-05: Admin tries to remove a user who is not a member of the classroom |
| **Purpose** | Verify that the system returns a not-found response when attempting to remove a user who is not a member. |
| **Initiation Criteria** | Classroom with a known ID exists. No membership record exists for user ID 999. A valid admin authentication token is available. |
| **Execution Steps** | 1. Send a DELETE request to `/classrooms/{classroomId}/members/999`.<br>2. Include a valid admin authentication token in the request header. |
| **Expected Results** | Deletion is rejected. System returns 404 Not Found. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-S-CMR-01: Admin changes a student's role to admin |
| **Purpose** | Verify that an admin can promote an existing classroom member to the admin role. |
| **Initiation Criteria** | Classroom with a known ID exists. The target user is a STUDENT member. A valid admin authentication token is available. |
| **Execution Steps** | 1. Send a PATCH request to `/classrooms/{classroomId}/members/{userId}/role`.<br>2. Provide `{ "role": "ADMIN" }` in the request body.<br>3. Include a valid admin authentication token in the request header. |
| **Expected Results** | Member role is updated to ADMIN. System returns 200 OK. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-S-CMR-02: Admin tries to change a role in a classroom that does not exist |
| **Purpose** | Verify that the system returns a not-found response when the target classroom does not exist. |
| **Initiation Criteria** | No classroom with ID 999 exists. A valid admin authentication token is available. |
| **Execution Steps** | 1. Send a PATCH request to `/classrooms/999/members/{userId}/role`.<br>2. Provide a role in the request body.<br>3. Include a valid admin authentication token in the request header. |
| **Expected Results** | Update is rejected. System returns 404 Not Found. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-S-CMR-03: Non-admin user attempts to change a member's role |
| **Purpose** | Verify that only admins can change member roles and that students are blocked from this action. |
| **Initiation Criteria** | Classroom with a known ID exists. The requesting user is a STUDENT. A valid student authentication token is available. |
| **Execution Steps** | 1. Send a PATCH request to `/classrooms/{classroomId}/members/{userId}/role` using the student's token.<br>2. Provide a new role in the request body.<br>3. Include the student's authentication token in the request header. |
| **Expected Results** | Update is rejected. System returns 403 Forbidden. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-S-CMR-04: Admin tries to change the role of a user who is not in the classroom |
| **Purpose** | Verify that the system returns a not-found response when the target user is not a member. |
| **Initiation Criteria** | Classroom with a known ID exists. No membership record exists for user ID 999. A valid admin authentication token is available. |
| **Execution Steps** | 1. Send a PATCH request to `/classrooms/{classroomId}/members/999/role`.<br>2. Provide a new role in the request body.<br>3. Include a valid admin authentication token in the request header. |
| **Expected Results** | Update is rejected. System returns 404 Not Found. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-S-CMR-05: Admin tries to assign a role that the member already holds |
| **Purpose** | Verify that the system prevents no-op role updates and informs the caller of the conflict. |
| **Initiation Criteria** | Classroom with a known ID exists. The target user is already a STUDENT. A valid admin authentication token is available. |
| **Execution Steps** | 1. Send a PATCH request to `/classrooms/{classroomId}/members/{userId}/role`.<br>2. Provide `{ "role": "STUDENT" }` in the request body (the role the user already holds).<br>3. Include a valid admin authentication token in the request header. |
| **Expected Results** | Update is rejected. System returns 409 Conflict. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-S-LM-01: Admin views the full member list of a classroom |
| **Purpose** | Verify that an admin can retrieve all members currently enrolled in a classroom. |
| **Initiation Criteria** | Classroom with a known ID exists and has at least one member. A valid admin authentication token is available. |
| **Execution Steps** | 1. Send a GET request to `/classrooms/{classroomId}/members`.<br>2. Include a valid admin authentication token in the request header. |
| **Expected Results** | A list of all members is returned. System returns 200 OK. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-S-LM-02: Admin tries to list members of a classroom that does not exist |
| **Purpose** | Verify that the system returns a not-found response when the target classroom does not exist. |
| **Initiation Criteria** | No classroom with ID 999 exists. A valid admin authentication token is available. |
| **Execution Steps** | 1. Send a GET request to `/classrooms/999/members`.<br>2. Include a valid admin authentication token in the request header. |
| **Expected Results** | No list is returned. System returns 404 Not Found. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-S-GM-01: Admin views a single member's details in a classroom |
| **Purpose** | Verify that an admin can retrieve the details of one specific member in a classroom. |
| **Initiation Criteria** | Classroom with a known ID exists. The target user is a member. A valid admin authentication token is available. |
| **Execution Steps** | 1. Send a GET request to `/classrooms/{classroomId}/members/{userId}`.<br>2. Include a valid admin authentication token in the request header. |
| **Expected Results** | Member details are returned. System returns 200 OK. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-S-GM-02: Admin tries to view a member in a classroom that does not exist |
| **Purpose** | Verify that the system returns a not-found response when the target classroom does not exist. |
| **Initiation Criteria** | No classroom with ID 999 exists. A valid admin authentication token is available. |
| **Execution Steps** | 1. Send a GET request to `/classrooms/999/members/{userId}`.<br>2. Include a valid admin authentication token in the request header. |
| **Expected Results** | No details are returned. System returns 404 Not Found. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-S-GM-03: Admin tries to view a user who is not a member of the classroom |
| **Purpose** | Verify that the system returns a not-found response when the target user has no membership in the classroom. |
| **Initiation Criteria** | Classroom with a known ID exists. No membership record exists for user ID 999 in that classroom. A valid admin authentication token is available. |
| **Execution Steps** | 1. Send a GET request to `/classrooms/{classroomId}/members/999`.<br>2. Include a valid admin authentication token in the request header. |
| **Expected Results** | No details are returned. System returns 404 Not Found. |

---

# FEATURE 3: Classroom

**User Story:** As a teacher, I want to create, read, update, and delete classrooms so that I can organize my students into separate learning spaces.

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-CC-01: Teacher creates a classroom with a name and description |
| **Purpose** | Verify that a teacher can successfully create a classroom by providing all fields. |
| **Initiation Criteria** | A valid authentication token for a teacher is available. |
| **Execution Steps** | 1. Send a POST request to `/classrooms`.<br>2. Provide `{ "name": "Math", "description": "Basic math" }` in the request body.<br>3. Include a valid authentication token in the request header. |
| **Expected Results** | Classroom is created. System returns 201 Created with the new classroom data including a generated classCode. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-CC-02: Teacher creates a classroom without providing a description |
| **Purpose** | Verify that description is optional and the classroom can be created with only a name. |
| **Initiation Criteria** | A valid authentication token for a teacher is available. |
| **Execution Steps** | 1. Send a POST request to `/classrooms`.<br>2. Provide `{ "name": "Math" }` in the request body, omitting description.<br>3. Include a valid authentication token in the request header. |
| **Expected Results** | Classroom is created. System returns 201 Created. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-CC-03: Teacher tries to create a classroom without providing a name |
| **Purpose** | Verify that the name field is required and that the system rejects creation without it. |
| **Initiation Criteria** | A valid authentication token for a teacher is available. |
| **Execution Steps** | 1. Send a POST request to `/classrooms`.<br>2. Provide `{ "description": "Basic math" }` in the request body, omitting the name field.<br>3. Include a valid authentication token in the request header. |
| **Expected Results** | Classroom is not created. System returns 400 Bad Request. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-CC-04: Teacher submits an empty request body to the classroom creation endpoint |
| **Purpose** | Verify that the system rejects completely empty requests and does not create any record. |
| **Initiation Criteria** | A valid authentication token for a teacher is available. |
| **Execution Steps** | 1. Send a POST request to `/classrooms`.<br>2. Provide an empty JSON body `{}`.<br>3. Include a valid authentication token in the request header. |
| **Expected Results** | Classroom is not created. System returns 400 Bad Request. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-CC-05: Teacher submits a number instead of text for the classroom name |
| **Purpose** | Verify that the system enforces the correct data type for the name field. |
| **Initiation Criteria** | A valid authentication token for a teacher is available. |
| **Execution Steps** | 1. Send a POST request to `/classrooms`.<br>2. Provide `{ "name": 123 }` in the request body.<br>3. Include a valid authentication token in the request header. |
| **Expected Results** | Classroom is not created. System returns 400 Bad Request. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-GC-01: User retrieves a classroom using a valid class code |
| **Purpose** | Verify that a user can look up a classroom by entering its class code. |
| **Initiation Criteria** | A classroom with classCode "MTH01" exists. A valid authentication token is available. |
| **Execution Steps** | 1. Send a GET request to `/classrooms?classCode=MTH01`.<br>2. Include a valid authentication token in the request header. |
| **Expected Results** | Classroom details are returned. System returns 200 OK. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-GC-02: User enters a class code that does not match any classroom |
| **Purpose** | Verify that the system returns a not-found response when no classroom matches the given class code. |
| **Initiation Criteria** | No classroom with classCode "XXX99" exists. A valid authentication token is available. |
| **Execution Steps** | 1. Send a GET request to `/classrooms?classCode=XXX99`.<br>2. Include a valid authentication token in the request header. |
| **Expected Results** | No classroom is returned. System returns 404 Not Found. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-GC-03: User submits an empty string as the class code |
| **Purpose** | Verify that the system rejects a blank class code as invalid input. |
| **Initiation Criteria** | A valid authentication token is available. |
| **Execution Steps** | 1. Send a GET request to `/classrooms?classCode=`.<br>2. Include a valid authentication token in the request header. |
| **Expected Results** | Request is rejected. System returns 400 Bad Request. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-GI-01: Teacher retrieves a classroom using its numeric ID |
| **Purpose** | Verify that a teacher can fetch classroom details using a known valid classroom ID. |
| **Initiation Criteria** | A classroom with a known ID exists. A valid authentication token is available. |
| **Execution Steps** | 1. Send a GET request to `/classrooms/{classroomId}` using a valid classroom ID.<br>2. Include a valid authentication token in the request header. |
| **Expected Results** | Classroom details are returned. System returns 200 OK. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-GI-02: Teacher submits a non-numeric value as the classroom ID |
| **Purpose** | Verify that the system rejects requests where the classroom ID is not a valid number. This was previously incorrectly expected to return 500 — it must return 400. |
| **Initiation Criteria** | A valid authentication token is available. |
| **Execution Steps** | 1. Send a GET request to `/classrooms/abc`.<br>2. Include a valid authentication token in the request header. |
| **Expected Results** | Request is rejected. System returns 400 Bad Request. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-GI-03: Teacher tries to retrieve a classroom that does not exist |
| **Purpose** | Verify that the system returns a not-found response when no classroom matches the given ID. |
| **Initiation Criteria** | No classroom with ID 999 exists. A valid authentication token is available. |
| **Execution Steps** | 1. Send a GET request to `/classrooms/999`.<br>2. Include a valid authentication token in the request header. |
| **Expected Results** | No classroom data is returned. System returns 404 Not Found. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-UI-01: Teacher updates the name of an existing classroom |
| **Purpose** | Verify that a teacher can successfully change the name of a classroom they manage. |
| **Initiation Criteria** | A classroom with a known ID exists. The requesting user is the classroom owner. A valid authentication token is available. |
| **Execution Steps** | 1. Send a PATCH request to `/classrooms/{classroomId}`.<br>2. Provide `{ "name": "New Math" }` in the request body.<br>3. Include a valid authentication token in the request header. |
| **Expected Results** | Classroom name is updated. System returns 200 OK with the updated classroom data. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-UI-02: Teacher submits a non-numeric value as the classroom ID when updating |
| **Purpose** | Verify that the system rejects update requests where the classroom ID is not a valid number. |
| **Initiation Criteria** | A valid authentication token is available. |
| **Execution Steps** | 1. Send a PATCH request to `/classrooms/abc`.<br>2. Provide a new name in the request body.<br>3. Include a valid authentication token in the request header. |
| **Expected Results** | Request is rejected. System returns 400 Bad Request. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-UI-03: Teacher tries to update a classroom that does not exist |
| **Purpose** | Verify that the system returns a not-found response when attempting to update a non-existent classroom. |
| **Initiation Criteria** | No classroom with ID 999 exists. A valid authentication token is available. |
| **Execution Steps** | 1. Send a PATCH request to `/classrooms/999`.<br>2. Provide `{ "name": "New Math" }` in the request body.<br>3. Include a valid authentication token in the request header. |
| **Expected Results** | Update is rejected. System returns 404 Not Found. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-UI-04: Teacher submits an empty string as the updated classroom name |
| **Purpose** | Verify that the system prevents a classroom name from being set to an empty string. |
| **Initiation Criteria** | A classroom with a known ID exists. A valid authentication token is available. |
| **Execution Steps** | 1. Send a PATCH request to `/classrooms/{classroomId}`.<br>2. Provide `{ "name": "" }` in the request body.<br>3. Include a valid authentication token in the request header. |
| **Expected Results** | Update is rejected. System returns 400 Bad Request. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-DI-01: Teacher deletes an existing classroom |
| **Purpose** | Verify that a teacher can permanently delete a classroom they manage. |
| **Initiation Criteria** | A classroom with a known ID exists. The requesting user is the classroom owner. A valid authentication token is available. |
| **Execution Steps** | 1. Send a DELETE request to `/classrooms/{classroomId}`.<br>2. Include a valid authentication token in the request header. |
| **Expected Results** | Classroom is permanently deleted. System returns 204 No Content. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-DI-02: Teacher submits a non-numeric value as the classroom ID when deleting |
| **Purpose** | Verify that the system rejects delete requests where the classroom ID is not a valid number. |
| **Initiation Criteria** | A valid authentication token is available. |
| **Execution Steps** | 1. Send a DELETE request to `/classrooms/abc`.<br>2. Include a valid authentication token in the request header. |
| **Expected Results** | Request is rejected. System returns 400 Bad Request. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-DI-03: Teacher tries to delete a classroom that does not exist |
| **Purpose** | Verify that the system returns a not-found response when attempting to delete a non-existent classroom. |
| **Initiation Criteria** | No classroom with ID 999 exists. A valid authentication token is available. |
| **Execution Steps** | 1. Send a DELETE request to `/classrooms/999`.<br>2. Include a valid authentication token in the request header. |
| **Expected Results** | Deletion is rejected. System returns 404 Not Found. |

---

# FEATURE 4: Classroom View (Access Control)

**User Story:** As a user, I want to only see classrooms I own or belong to so that I cannot access other teachers' or students' private content.

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-CL-01: User views the list of classrooms they own |
| **Purpose** | Verify that a user's classroom list includes classrooms they have created. |
| **Initiation Criteria** | User ID 10 is authenticated and owns Class A. A valid authentication token is available. |
| **Execution Steps** | 1. Send a GET request to `/classrooms/me`.<br>2. Include the authentication token for user ID 10 in the request header. |
| **Expected Results** | Class A appears in the returned list. System returns 200 OK. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-CL-02: User views the list of classrooms they have joined as a member |
| **Purpose** | Verify that a user's classroom list includes classrooms where they are an enrolled member. |
| **Initiation Criteria** | User ID 10 is authenticated and is a member of Class B. A valid authentication token is available. |
| **Execution Steps** | 1. Send a GET request to `/classrooms/me`.<br>2. Include the authentication token for user ID 10 in the request header. |
| **Expected Results** | Class B appears in the returned list. System returns 200 OK. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-CL-03: User views a combined list of owned and joined classrooms |
| **Purpose** | Verify that the classroom list correctly merges both owned and member classrooms into one result. |
| **Initiation Criteria** | User ID 10 owns Class A and is a member of Class B. A valid authentication token is available. |
| **Execution Steps** | 1. Send a GET request to `/classrooms/me`.<br>2. Include the authentication token for user ID 10 in the request header. |
| **Expected Results** | Both Class A and Class B appear in the list. System returns 200 OK. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-CL-04: User with no classroom associations receives an empty list |
| **Purpose** | Verify that the system returns an empty list rather than an error when a user has no classroom connections. |
| **Initiation Criteria** | User ID 10 is authenticated and belongs to no classrooms. A valid authentication token is available. |
| **Execution Steps** | 1. Send a GET request to `/classrooms/me`.<br>2. Include the authentication token for user ID 10 in the request header. |
| **Expected Results** | An empty list is returned. System returns 200 OK. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-CL-05: User's classroom list does not include classrooms they have no connection to |
| **Purpose** | Verify that the system filters out classrooms the user does not own or belong to. |
| **Initiation Criteria** | User ID 10 is authenticated and is not a member or owner of Class C. A valid authentication token is available. |
| **Execution Steps** | 1. Send a GET request to `/classrooms/me`.<br>2. Include the authentication token for user ID 10 in the request header.<br>3. Check whether Class C appears in the response. |
| **Expected Results** | Class C does not appear in the returned list. System returns 200 OK. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-CL-06: User attempts to access a classroom they have no connection to |
| **Purpose** | Verify that the system blocks direct access to classrooms the user does not own or belong to. |
| **Initiation Criteria** | User ID 10 is authenticated and has no membership or ownership of classroom ID 3. A valid authentication token is available. |
| **Execution Steps** | 1. Send a GET request to `/classrooms/3`.<br>2. Include the authentication token for user ID 10 in the request header. |
| **Expected Results** | Access is denied. System returns 403 Forbidden. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-CL-07: Unauthenticated user attempts to access a classroom by direct URL |
| **Purpose** | Verify that the system blocks all access to classroom data when no valid authentication token is provided. |
| **Initiation Criteria** | No authentication token is present. |
| **Execution Steps** | 1. Send a GET request to `/classrooms/3`.<br>2. Do not include any Authorization header in the request. |
| **Expected Results** | Access is blocked. System returns 403 Forbidden. |

---

# FEATURE 5: Coding Challenges

**User Story:** As a teacher, I want to create, read, update, and delete coding challenges so that I can assign programming problems for students to solve.

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-CH-C-01: Teacher creates a new coding challenge with all required fields |
| **Purpose** | Verify that a teacher can successfully create a coding challenge with a valid title and description. |
| **Initiation Criteria** | No challenge with the title "Loops" exists. A valid teacher authentication token is available. |
| **Execution Steps** | 1. Send a POST request to `/challenges`.<br>2. Provide `{ "title": "Loops", "description": "Solve loops" }` in the request body.<br>3. Include a valid authentication token in the request header. |
| **Expected Results** | Challenge is created. System returns 201 Created with the new challenge data. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-CH-C-02: Teacher tries to create a challenge without providing a title |
| **Purpose** | Verify that title is a required field and that the system rejects creation without it. |
| **Initiation Criteria** | A valid teacher authentication token is available. |
| **Execution Steps** | 1. Send a POST request to `/challenges`.<br>2. Provide `{ "description": "Problem" }` in the request body, omitting the title.<br>3. Include a valid authentication token in the request header. |
| **Expected Results** | Challenge is not created. System returns 400 Bad Request. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-CH-C-03: Teacher tries to create a challenge without providing a description |
| **Purpose** | Verify that description is a required field and that the system rejects creation without it. |
| **Initiation Criteria** | A valid teacher authentication token is available. |
| **Execution Steps** | 1. Send a POST request to `/challenges`.<br>2. Provide `{ "title": "Loops" }` in the request body, omitting description.<br>3. Include a valid authentication token in the request header. |
| **Expected Results** | Challenge is not created. System returns 400 Bad Request. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-CH-C-04: Teacher submits an empty request body to the challenge creation endpoint |
| **Purpose** | Verify that the system rejects completely empty requests and does not create any record. |
| **Initiation Criteria** | A valid teacher authentication token is available. |
| **Execution Steps** | 1. Send a POST request to `/challenges`.<br>2. Provide an empty JSON body `{}`.<br>3. Include a valid authentication token in the request header. |
| **Expected Results** | Challenge is not created. System returns 400 Bad Request. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-CH-C-05: Teacher submits a number instead of text for the challenge title |
| **Purpose** | Verify that the system enforces the correct data type for the title field. |
| **Initiation Criteria** | A valid teacher authentication token is available. |
| **Execution Steps** | 1. Send a POST request to `/challenges`.<br>2. Provide `{ "title": 123, "description": "Solve loops" }` in the request body.<br>3. Include a valid authentication token in the request header. |
| **Expected Results** | Challenge is not created. System returns 400 Bad Request. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-CH-C-06: Teacher submits a number instead of text for the challenge description |
| **Purpose** | Verify that the system enforces the correct data type for the description field. |
| **Initiation Criteria** | A valid teacher authentication token is available. |
| **Execution Steps** | 1. Send a POST request to `/challenges`.<br>2. Provide `{ "title": "Loops", "description": 999 }` in the request body.<br>3. Include a valid authentication token in the request header. |
| **Expected Results** | Challenge is not created. System returns 400 Bad Request. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-CH-C-07: Teacher submits a challenge title that exceeds the maximum allowed length |
| **Purpose** | Verify that the system enforces a maximum character limit on the title field. |
| **Initiation Criteria** | A valid teacher authentication token is available. |
| **Execution Steps** | 1. Send a POST request to `/challenges`.<br>2. Provide a title string of 300 or more characters in the request body.<br>3. Include a valid authentication token in the request header. |
| **Expected Results** | Challenge is not created. System returns 400 Bad Request with a length validation error. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-CH-C-08: Teacher creates a challenge using a title that already exists |
| **Purpose** | Verify that the system prevents duplicate challenge titles. |
| **Initiation Criteria** | A challenge with the title "Loops" already exists. A valid teacher authentication token is available. |
| **Execution Steps** | 1. Send a POST request to `/challenges`.<br>2. Provide `{ "title": "Loops", "description": "Solve loops" }` in the request body.<br>3. Include a valid authentication token in the request header. |
| **Expected Results** | Challenge is not created. System returns 409 Conflict. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-CH-R-01: Teacher views an existing challenge by its ID |
| **Purpose** | Verify that a teacher can retrieve full challenge details using a valid challenge ID. |
| **Initiation Criteria** | A challenge with a known ID exists. A valid authentication token is available. |
| **Execution Steps** | 1. Send a GET request to `/challenges/{challengeId}` using a valid challenge ID.<br>2. Include a valid authentication token in the request header. |
| **Expected Results** | Challenge details are returned. System returns 200 OK. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-CH-R-02: Teacher tries to view a challenge that does not exist |
| **Purpose** | Verify that the system returns a not-found response when the requested challenge ID does not exist. |
| **Initiation Criteria** | No challenge with ID 999 exists. A valid authentication token is available. |
| **Execution Steps** | 1. Send a GET request to `/challenges/999`.<br>2. Include a valid authentication token in the request header. |
| **Expected Results** | No data is returned. System returns 404 Not Found. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-CH-R-03: Teacher submits a non-numeric value as the challenge ID |
| **Purpose** | Verify that the system rejects requests where the challenge ID is not a valid number. |
| **Initiation Criteria** | A valid authentication token is available. |
| **Execution Steps** | 1. Send a GET request to `/challenges/abc`.<br>2. Include a valid authentication token in the request header. |
| **Expected Results** | Request is rejected. System returns 400 Bad Request. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-CH-R-04: Teacher submits zero as the challenge ID |
| **Purpose** | Verify that zero is treated as an invalid ID since valid IDs must be positive integers. |
| **Initiation Criteria** | A valid authentication token is available. |
| **Execution Steps** | 1. Send a GET request to `/challenges/0`.<br>2. Include a valid authentication token in the request header. |
| **Expected Results** | Request is rejected. System returns 400 Bad Request. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-CH-R-05: Teacher submits a negative number as the challenge ID |
| **Purpose** | Verify that negative numbers are treated as invalid IDs since valid IDs must be positive integers. |
| **Initiation Criteria** | A valid authentication token is available. |
| **Execution Steps** | 1. Send a GET request to `/challenges/-5`.<br>2. Include a valid authentication token in the request header. |
| **Expected Results** | Request is rejected. System returns 400 Bad Request. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-CH-R-06: Teacher views the full list of all challenges |
| **Purpose** | Verify that a teacher can retrieve a list of all available coding challenges in the system. |
| **Initiation Criteria** | At least one challenge exists. A valid authentication token is available. |
| **Execution Steps** | 1. Send a GET request to `/challenges`.<br>2. Include a valid authentication token in the request header. |
| **Expected Results** | A list of challenges is returned. System returns 200 OK. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-CH-R-07: Teacher views the challenge list when no challenges exist |
| **Purpose** | Verify that the system returns an empty list rather than an error when no challenges have been created. |
| **Initiation Criteria** | The challenges table is empty. A valid authentication token is available. |
| **Execution Steps** | 1. Send a GET request to `/challenges`.<br>2. Include a valid authentication token in the request header. |
| **Expected Results** | An empty list is returned. System returns 200 OK. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-CH-U-01: Teacher updates the title of an existing challenge |
| **Purpose** | Verify that a teacher can successfully change the title of a challenge. |
| **Initiation Criteria** | A challenge with a known ID exists. No other challenge uses the title "Updated Title". A valid teacher authentication token is available. |
| **Execution Steps** | 1. Send a PATCH request to `/challenges/{challengeId}`.<br>2. Provide `{ "title": "Updated Title" }` in the request body.<br>3. Include a valid authentication token in the request header. |
| **Expected Results** | Challenge title is updated. System returns 200 OK. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-CH-U-02: Teacher updates only the description of an existing challenge |
| **Purpose** | Verify that partial updates are supported and description can be changed independently of title. |
| **Initiation Criteria** | A challenge with a known ID exists. A valid teacher authentication token is available. |
| **Execution Steps** | 1. Send a PATCH request to `/challenges/{challengeId}`.<br>2. Provide `{ "description": "New desc" }` in the request body.<br>3. Include a valid authentication token in the request header. |
| **Expected Results** | Challenge description is updated. System returns 200 OK. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-CH-U-03: Teacher tries to update a challenge that does not exist |
| **Purpose** | Verify that the system returns a not-found response when attempting to update a non-existent challenge. |
| **Initiation Criteria** | No challenge with ID 999 exists. A valid teacher authentication token is available. |
| **Execution Steps** | 1. Send a PATCH request to `/challenges/999`.<br>2. Provide a new title in the request body.<br>3. Include a valid authentication token in the request header. |
| **Expected Results** | Update is rejected. System returns 404 Not Found. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-CH-U-04: Teacher submits a number instead of text for the updated challenge title |
| **Purpose** | Verify that the system enforces correct data types when updating the title field. |
| **Initiation Criteria** | A challenge with a known ID exists. A valid teacher authentication token is available. |
| **Execution Steps** | 1. Send a PATCH request to `/challenges/{challengeId}`.<br>2. Provide `{ "title": 555 }` in the request body.<br>3. Include a valid authentication token in the request header. |
| **Expected Results** | Update is rejected. System returns 400 Bad Request. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-CH-U-05: Teacher submits an empty body to the challenge update endpoint |
| **Purpose** | Verify that an empty update request is rejected since at least one field must be provided. |
| **Initiation Criteria** | A challenge with a known ID exists. A valid teacher authentication token is available. |
| **Execution Steps** | 1. Send a PATCH request to `/challenges/{challengeId}`.<br>2. Provide an empty JSON body `{}`.<br>3. Include a valid authentication token in the request header. |
| **Expected Results** | Update is rejected. System returns 400 Bad Request. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-CH-U-06: Teacher updates a challenge title to one that already belongs to another challenge |
| **Purpose** | Verify that the system prevents duplicate challenge titles when updating. |
| **Initiation Criteria** | A challenge titled "Loops" already exists. The teacher is updating a different challenge. A valid teacher authentication token is available. |
| **Execution Steps** | 1. Send a PATCH request to `/challenges/{challengeId}` (a different challenge, not the one titled "Loops").<br>2. Provide `{ "title": "Loops" }` in the request body.<br>3. Include a valid authentication token in the request header. |
| **Expected Results** | Update is rejected. System returns 409 Conflict. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-CH-D-01: Teacher deletes an existing challenge that has no attachments |
| **Purpose** | Verify that a teacher can permanently delete a standalone challenge with no linked assignments or test cases. |
| **Initiation Criteria** | A challenge with a known ID exists and is not attached to any assignment or test case. A valid teacher authentication token is available. |
| **Execution Steps** | 1. Send a DELETE request to `/challenges/{challengeId}`.<br>2. Include a valid authentication token in the request header. |
| **Expected Results** | Challenge is deleted. System returns 204 No Content. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-CH-D-02: Teacher tries to delete a challenge that does not exist |
| **Purpose** | Verify that the system returns a not-found response when attempting to delete a non-existent challenge. |
| **Initiation Criteria** | No challenge with ID 999 exists. A valid teacher authentication token is available. |
| **Execution Steps** | 1. Send a DELETE request to `/challenges/999`.<br>2. Include a valid authentication token in the request header. |
| **Expected Results** | Deletion is rejected. System returns 404 Not Found. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-CH-D-03: Teacher submits a non-numeric value as the challenge ID when deleting |
| **Purpose** | Verify that the system rejects delete requests where the challenge ID is not a valid number. |
| **Initiation Criteria** | A valid teacher authentication token is available. |
| **Execution Steps** | 1. Send a DELETE request to `/challenges/abc`.<br>2. Include a valid authentication token in the request header. |
| **Expected Results** | Request is rejected. System returns 400 Bad Request. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-CH-D-04: Unauthenticated user attempts to delete a challenge |
| **Purpose** | Verify that the system blocks deletion attempts when no authentication token is provided. |
| **Initiation Criteria** | A challenge with a known ID exists. No authentication token is present. |
| **Execution Steps** | 1. Send a DELETE request to `/challenges/{challengeId}`.<br>2. Do not include any Authorization header in the request. |
| **Expected Results** | Deletion is blocked. System returns 401 Unauthorized. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-CH-D-05: Student attempts to delete a challenge |
| **Purpose** | Verify that students do not have permission to delete challenges and are blocked from this action. |
| **Initiation Criteria** | A challenge with a known ID exists. A valid student authentication token is available. |
| **Execution Steps** | 1. Send a DELETE request to `/challenges/{challengeId}`.<br>2. Include a valid student authentication token in the request header. |
| **Expected Results** | Deletion is blocked. System returns 403 Forbidden. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-CH-D-06: Teacher deletes a challenge that has test cases attached to it |
| **Purpose** | Verify that the system prevents deletion of a challenge when it still has child test case records linked to it. |
| **Initiation Criteria** | A challenge with a known ID exists and has one or more test cases linked to it. A valid teacher authentication token is available. |
| **Execution Steps** | 1. Confirm the challenge has at least one test case by sending a GET request to `/challenges/{challengeId}/testcases`.<br>2. Send a DELETE request to `/challenges/{challengeId}`.<br>3. Include a valid authentication token in the request header. |
| **Expected Results** | Deletion is blocked to protect data integrity. System returns 409 Conflict. |

---

# FEATURE 6: Challenge Test Cases

**User Story:** As a teacher, I want to create, read, update, and delete test cases for a coding challenge so that the system can automatically evaluate whether a student's code produces the correct output.

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-TC-C-01: Teacher adds a test case to an existing challenge |
| **Purpose** | Verify that a teacher can successfully add an input/output test case to a challenge. |
| **Initiation Criteria** | A challenge with a known ID exists. A valid teacher authentication token is available. |
| **Execution Steps** | 1. Send a POST request to `/challenges/{challengeId}/testcases`.<br>2. Provide `{ "input": "2", "output": "4" }` in the request body.<br>3. Include a valid authentication token in the request header. |
| **Expected Results** | Test case is created. System returns 201 Created. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-TC-C-02: Teacher tries to create a test case without providing an input value |
| **Purpose** | Verify that the input field is required and that the system rejects test case creation without it. |
| **Initiation Criteria** | A challenge with a known ID exists. A valid teacher authentication token is available. |
| **Execution Steps** | 1. Send a POST request to `/challenges/{challengeId}/testcases`.<br>2. Provide `{ "output": "4" }` in the request body, omitting the input field.<br>3. Include a valid authentication token in the request header. |
| **Expected Results** | Test case is not created. System returns 400 Bad Request. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-TC-C-03: Teacher tries to create a test case without providing an output value |
| **Purpose** | Verify that the output field is required and that the system rejects test case creation without it. |
| **Initiation Criteria** | A challenge with a known ID exists. A valid teacher authentication token is available. |
| **Execution Steps** | 1. Send a POST request to `/challenges/{challengeId}/testcases`.<br>2. Provide `{ "input": "2" }` in the request body, omitting the output field.<br>3. Include a valid authentication token in the request header. |
| **Expected Results** | Test case is not created. System returns 400 Bad Request. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-TC-C-04: Teacher tries to create a test case without specifying which challenge it belongs to |
| **Purpose** | Verify that challengeId is required and that the system rejects test case creation without it. |
| **Initiation Criteria** | A valid teacher authentication token is available. |
| **Execution Steps** | 1. Send a POST request to `/testcases` without a challengeId in the path.<br>2. Provide `{ "input": "2", "output": "4" }` in the request body.<br>3. Include a valid authentication token in the request header. |
| **Expected Results** | Test case is not created. System returns 400 Bad Request. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-TC-C-05: Teacher tries to add a test case to a challenge that does not exist |
| **Purpose** | Verify that the system returns a not-found response when the referenced challenge does not exist. |
| **Initiation Criteria** | No challenge with ID 999 exists. A valid teacher authentication token is available. |
| **Execution Steps** | 1. Send a POST request to `/challenges/999/testcases`.<br>2. Provide `{ "input": "2", "output": "4" }` in the request body.<br>3. Include a valid authentication token in the request header. |
| **Expected Results** | Test case is not created. System returns 404 Not Found. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-TC-C-06: Teacher submits a number instead of text for the input field |
| **Purpose** | Verify that the system enforces the correct data type for the input field. |
| **Initiation Criteria** | A challenge with a known ID exists. A valid teacher authentication token is available. |
| **Execution Steps** | 1. Send a POST request to `/challenges/{challengeId}/testcases`.<br>2. Provide `{ "input": 123, "output": "4" }` in the request body.<br>3. Include a valid authentication token in the request header. |
| **Expected Results** | Test case is not created. System returns 400 Bad Request. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-TC-C-07: Teacher tries to add a test case that is identical to one that already exists |
| **Purpose** | Verify that the system prevents duplicate test cases with the same input and output for the same challenge. |
| **Initiation Criteria** | Challenge with a known ID already has a test case with input "2" and output "4". A valid teacher authentication token is available. |
| **Execution Steps** | 1. Send a POST request to `/challenges/{challengeId}/testcases`.<br>2. Provide `{ "input": "2", "output": "4" }` in the request body.<br>3. Include a valid authentication token in the request header. |
| **Expected Results** | Test case is not created. System returns 409 Conflict. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-TC-C-08: Unauthenticated user attempts to add a test case |
| **Purpose** | Verify that the system blocks test case creation when no authentication token is provided. |
| **Initiation Criteria** | A challenge with a known ID exists. No authentication token is present. |
| **Execution Steps** | 1. Send a POST request to `/challenges/{challengeId}/testcases`.<br>2. Provide `{ "input": "2", "output": "4" }` in the request body.<br>3. Do not include any Authorization header in the request. |
| **Expected Results** | Creation is blocked. System returns 401 Unauthorized. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-TC-C-09: Student attempts to add a test case to a challenge |
| **Purpose** | Verify that students do not have permission to add test cases and are blocked from this action. |
| **Initiation Criteria** | A challenge with a known ID exists. A valid student authentication token is available. |
| **Execution Steps** | 1. Send a POST request to `/challenges/{challengeId}/testcases`.<br>2. Provide `{ "input": "2", "output": "4" }` in the request body.<br>3. Include a valid student authentication token in the request header. |
| **Expected Results** | Creation is blocked. System returns 403 Forbidden. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-TC-R-01: Teacher views all test cases for a challenge |
| **Purpose** | Verify that a teacher can retrieve the full list of test cases belonging to a specific challenge. |
| **Initiation Criteria** | A challenge with a known ID exists and has at least one test case. A valid authentication token is available. |
| **Execution Steps** | 1. Send a GET request to `/challenges/{challengeId}/testcases`.<br>2. Include a valid authentication token in the request header. |
| **Expected Results** | A list of test cases is returned. System returns 200 OK. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-TC-R-02: Teacher views test cases for a challenge that has none |
| **Purpose** | Verify that the system returns an empty list rather than an error when a challenge has no test cases yet. |
| **Initiation Criteria** | A challenge with a known ID exists but has no test cases. A valid authentication token is available. |
| **Execution Steps** | 1. Send a GET request to `/challenges/{challengeId}/testcases` for a challenge with no test cases.<br>2. Include a valid authentication token in the request header. |
| **Expected Results** | An empty list is returned. System returns 200 OK. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-TC-R-03: Teacher tries to view test cases for a challenge that does not exist |
| **Purpose** | Verify that the system returns a not-found response when the referenced challenge does not exist. |
| **Initiation Criteria** | No challenge with ID 999 exists. A valid authentication token is available. |
| **Execution Steps** | 1. Send a GET request to `/challenges/999/testcases`.<br>2. Include a valid authentication token in the request header. |
| **Expected Results** | No data is returned. System returns 404 Not Found. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-TC-R-04: Unauthenticated user attempts to view test cases |
| **Purpose** | Verify that the system blocks access to test case data when no authentication token is provided. |
| **Initiation Criteria** | No authentication token is present. |
| **Execution Steps** | 1. Send a GET request to `/challenges/{challengeId}/testcases`.<br>2. Do not include any Authorization header in the request. |
| **Expected Results** | Access is blocked. System returns 401 Unauthorized. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-TC-U-01: Teacher updates only the output of an existing test case |
| **Purpose** | Verify that a teacher can change the expected output of a test case independently. |
| **Initiation Criteria** | A test case with a known ID exists for a challenge. A valid teacher authentication token is available. |
| **Execution Steps** | 1. Send a PATCH request to `/challenges/{challengeId}/testcases/{testcaseId}`.<br>2. Provide `{ "output": "8" }` in the request body.<br>3. Include a valid authentication token in the request header. |
| **Expected Results** | Test case output is updated. System returns 200 OK. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-TC-U-02: Teacher updates only the input of an existing test case |
| **Purpose** | Verify that a teacher can change the input of a test case independently. |
| **Initiation Criteria** | A test case with a known ID exists for a challenge. A valid teacher authentication token is available. |
| **Execution Steps** | 1. Send a PATCH request to `/challenges/{challengeId}/testcases/{testcaseId}`.<br>2. Provide `{ "input": "5" }` in the request body.<br>3. Include a valid authentication token in the request header. |
| **Expected Results** | Test case input is updated. System returns 200 OK. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-TC-U-08: Teacher updates both input and output of an existing test case |
| **Purpose** | Verify that a teacher can update both fields of a test case in a single request. |
| **Initiation Criteria** | A test case with a known ID exists. A valid teacher authentication token is available. |
| **Execution Steps** | 1. Send a PATCH request to `/challenges/{challengeId}/testcases/{testcaseId}`.<br>2. Provide `{ "input": "5", "output": "8" }` in the request body.<br>3. Include a valid authentication token in the request header. |
| **Expected Results** | Both fields are updated. System returns 200 OK. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-TC-U-03: Teacher tries to update a test case that does not exist |
| **Purpose** | Verify that the system returns a not-found response when attempting to update a non-existent test case. |
| **Initiation Criteria** | No test case with ID 999 exists. A valid teacher authentication token is available. |
| **Execution Steps** | 1. Send a PATCH request to `/challenges/{challengeId}/testcases/999`.<br>2. Provide a new output value in the request body.<br>3. Include a valid authentication token in the request header. |
| **Expected Results** | Update is rejected. System returns 404 Not Found. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-TC-U-04: Teacher submits a number instead of text for the output value |
| **Purpose** | Verify that the system enforces the correct data type when updating the output field. |
| **Initiation Criteria** | A test case with a known ID exists. A valid teacher authentication token is available. |
| **Execution Steps** | 1. Send a PATCH request to `/challenges/{challengeId}/testcases/{testcaseId}`.<br>2. Provide `{ "output": 123 }` in the request body.<br>3. Include a valid authentication token in the request header. |
| **Expected Results** | Update is rejected. System returns 400 Bad Request. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-TC-U-07: Teacher updates a test case to match an identical one that already exists |
| **Purpose** | Verify that the system prevents duplicate test cases when updating. |
| **Initiation Criteria** | Challenge with a known ID already has a test case with input "2" and output "4". The teacher is editing a different test case for the same challenge. A valid teacher authentication token is available. |
| **Execution Steps** | 1. Send a PATCH request to `/challenges/{challengeId}/testcases/{testcaseId}` (a different test case, not the one with input "2" / output "4").<br>2. Provide `{ "input": "2", "output": "4" }` in the request body.<br>3. Include a valid authentication token in the request header. |
| **Expected Results** | Update is rejected. System returns 409 Conflict. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-TC-U-05: Unauthenticated user attempts to update a test case |
| **Purpose** | Verify that the system blocks test case updates when no authentication token is provided. |
| **Initiation Criteria** | A test case with a known ID exists. No authentication token is present. |
| **Execution Steps** | 1. Send a PATCH request to `/challenges/{challengeId}/testcases/{testcaseId}`.<br>2. Provide a new value in the request body.<br>3. Do not include any Authorization header in the request. |
| **Expected Results** | Update is blocked. System returns 401 Unauthorized. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-TC-U-06: Student attempts to update a test case |
| **Purpose** | Verify that students do not have permission to update test cases. |
| **Initiation Criteria** | A test case with a known ID exists. A valid student authentication token is available. |
| **Execution Steps** | 1. Send a PATCH request to `/challenges/{challengeId}/testcases/{testcaseId}`.<br>2. Provide a new value in the request body.<br>3. Include a valid student authentication token in the request header. |
| **Expected Results** | Update is blocked. System returns 403 Forbidden. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-TC-D-01: Teacher deletes an existing test case |
| **Purpose** | Verify that a teacher can permanently delete a test case from a challenge. |
| **Initiation Criteria** | A test case with a known ID exists. A valid teacher authentication token is available. |
| **Execution Steps** | 1. Send a DELETE request to `/challenges/{challengeId}/testcases/{testcaseId}`.<br>2. Include a valid authentication token in the request header. |
| **Expected Results** | Test case is deleted. System returns 204 No Content. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-TC-D-02: Teacher tries to delete a test case that does not exist |
| **Purpose** | Verify that the system returns a not-found response when attempting to delete a non-existent test case. |
| **Initiation Criteria** | No test case with ID 999 exists. A valid teacher authentication token is available. |
| **Execution Steps** | 1. Send a DELETE request to `/challenges/{challengeId}/testcases/999`.<br>2. Include a valid authentication token in the request header. |
| **Expected Results** | Deletion is rejected. System returns 404 Not Found. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-TC-D-03: Teacher submits a non-numeric value as the test case ID when deleting |
| **Purpose** | Verify that the system rejects delete requests where the ID is not a valid number. |
| **Initiation Criteria** | A valid teacher authentication token is available. |
| **Execution Steps** | 1. Send a DELETE request to `/challenges/{challengeId}/testcases/abc`.<br>2. Include a valid authentication token in the request header. |
| **Expected Results** | Request is rejected. System returns 400 Bad Request. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-TC-D-04: Unauthenticated user attempts to delete a test case |
| **Purpose** | Verify that the system blocks deletion when no authentication token is provided. |
| **Initiation Criteria** | A test case with a known ID exists. No authentication token is present. |
| **Execution Steps** | 1. Send a DELETE request to `/challenges/{challengeId}/testcases/{testcaseId}`.<br>2. Do not include any Authorization header in the request. |
| **Expected Results** | Deletion is blocked. System returns 401 Unauthorized. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-TC-D-05: Student attempts to delete a test case |
| **Purpose** | Verify that students do not have permission to delete test cases. |
| **Initiation Criteria** | A test case with a known ID exists. A valid student authentication token is available. |
| **Execution Steps** | 1. Send a DELETE request to `/challenges/{challengeId}/testcases/{testcaseId}`.<br>2. Include a valid student authentication token in the request header. |
| **Expected Results** | Deletion is blocked. System returns 403 Forbidden. |

---

# FEATURE 7: Code Runner API

**User Story:** As a student, I want to submit my code and receive immediate feedback on whether my solution is correct so that I can learn from my mistakes and improve my programming skills.

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-CR-01: Student submits valid C code and receives the program output |
| **Purpose** | Verify that a student can execute a valid C program and receive its console output. |
| **Initiation Criteria** | The code runner service is available. A valid student authentication token is available. |
| **Execution Steps** | 1. Send a POST request to `/code-runner/execute`.<br>2. Provide `{ "sourceCode": "#include <stdio.h>\nint main(){ printf(\"Hello\"); return 0; }", "language": "C" }` in the request body.<br>3. Include a valid authentication token in the request header. |
| **Expected Results** | Program runs successfully. System returns 200 OK with output "Hello" and an empty testResults array. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-CR-02: Student submits C code that correctly solves a test case |
| **Purpose** | Verify that the system correctly evaluates code output against an expected result and marks the test case as passing. |
| **Initiation Criteria** | A test case exists with input "5" and expected output "5". A valid student authentication token is available. |
| **Execution Steps** | 1. Send a POST request to `/code-runner/execute`.<br>2. Provide valid C code that reads an integer from stdin and prints it, along with `"testCases": [{ "input": "5", "expectedOutput": "5" }]` in the request body.<br>3. Include a valid authentication token in the request header. |
| **Expected Results** | Program runs and output matches expected. System returns 200 OK with testResults[0].status equal to "PASS". |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-CR-03: Student submits C code that produces a wrong answer for a test case |
| **Purpose** | Verify that the system correctly detects a mismatch between actual and expected output and marks the test case as failing. |
| **Initiation Criteria** | A test case exists with expected output "5". A valid student authentication token is available. |
| **Execution Steps** | 1. Send a POST request to `/code-runner/execute`.<br>2. Provide C code that always prints "6" along with `"testCases": [{ "input": "5", "expectedOutput": "5" }]` in the request body.<br>3. Include a valid authentication token in the request header. |
| **Expected Results** | System returns 200 OK. testResults[0] contains expected "5", actual "6", and status "FAIL". |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-CR-04: Student submits an empty source code field |
| **Purpose** | Verify that the system rejects execution requests when the source code field is empty. |
| **Initiation Criteria** | A valid student authentication token is available. |
| **Execution Steps** | 1. Send a POST request to `/code-runner/execute`.<br>2. Provide `{ "sourceCode": "", "language": "C" }` in the request body.<br>3. Include a valid authentication token in the request header. |
| **Expected Results** | Execution is rejected. System returns 400 Bad Request with the message "sourceCode cannot be empty". |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-CR-05: Student submits code in an unsupported programming language |
| **Purpose** | Verify that the system rejects execution requests for languages that are not supported. |
| **Initiation Criteria** | A valid student authentication token is available. |
| **Execution Steps** | 1. Send a POST request to `/code-runner/execute`.<br>2. Provide `{ "sourceCode": "print('Hello')", "language": "Python" }` in the request body.<br>3. Include a valid authentication token in the request header. |
| **Expected Results** | Execution is rejected. System returns 400 Bad Request with the message "Unsupported language". |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-CR-06: Student submits code without specifying the programming language |
| **Purpose** | Verify that the language field is required and that the system rejects requests where it is missing. |
| **Initiation Criteria** | A valid student authentication token is available. |
| **Execution Steps** | 1. Send a POST request to `/code-runner/execute`.<br>2. Provide `{ "sourceCode": "int main(){}" }` in the request body, omitting the language field.<br>3. Include a valid authentication token in the request header. |
| **Expected Results** | Execution is rejected. System returns 400 Bad Request with a message indicating "language is required". |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-CR-07: Student submits C code that contains a syntax error |
| **Purpose** | Verify that the system returns a meaningful compiler error message when the submitted code cannot be compiled. |
| **Initiation Criteria** | A valid student authentication token is available. |
| **Execution Steps** | 1. Send a POST request to `/code-runner/execute`.<br>2. Provide C code that is missing a semicolon (e.g. `int main(){ printf("Hello") }`) along with `"language": "C"` in the request body.<br>3. Include a valid authentication token in the request header. |
| **Expected Results** | Execution fails at the compile stage. System returns 422 Unprocessable Entity with a compiler error log in the response body. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-CR-08: Student submits C code that runs an infinite loop |
| **Purpose** | Verify that the system enforces an execution time limit and terminates programs that run indefinitely. |
| **Initiation Criteria** | The execution timeout is configured (e.g. 5 seconds). A valid student authentication token is available. |
| **Execution Steps** | 1. Send a POST request to `/code-runner/execute`.<br>2. Provide `{ "sourceCode": "int main(){ while(1); }", "language": "C" }` in the request body.<br>3. Include a valid authentication token in the request header.<br>4. Wait for the response — do not cancel the request manually. |
| **Expected Results** | Execution is terminated after the timeout. System returns 408 Request Timeout with the message "Execution timeout". |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-CR-09: Student submits a source code payload that exceeds the size limit |
| **Purpose** | Verify that the system rejects oversized requests to prevent memory exhaustion and abuse. |
| **Initiation Criteria** | The payload size limit is configured at 10 MB. A valid student authentication token is available. |
| **Execution Steps** | 1. Send a POST request to `/code-runner/execute`.<br>2. Provide a sourceCode string larger than 10 MB along with `"language": "C"` in the request body.<br>3. Include a valid authentication token in the request header. |
| **Expected Results** | Request is rejected before execution. System returns 413 Payload Too Large. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-CR-10: Student submits code that generates an extremely large volume of output |
| **Purpose** | Verify that the system handles runaway output safely by truncating it without crashing. |
| **Initiation Criteria** | A valid student authentication token is available. |
| **Execution Steps** | 1. Send a POST request to `/code-runner/execute`.<br>2. Provide C code that prints inside a very large loop (millions of iterations) along with `"language": "C"` in the request body.<br>3. Include a valid authentication token in the request header. |
| **Expected Results** | Execution completes. System returns 200 OK with output truncated at the configured limit. System remains stable and does not crash. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-CR-11: Student submits C code that attempts to execute a destructive OS command |
| **Purpose** | Verify that the sandbox environment blocks submitted code from running dangerous system-level commands. |
| **Initiation Criteria** | The sandbox is configured and active. A valid student authentication token is available. |
| **Execution Steps** | 1. Send a POST request to `/code-runner/execute`.<br>2. Provide `{ "sourceCode": "#include<stdlib.h>\nint main(){ system(\"rm -rf /\"); return 0; }", "language": "C" }` in the request body.<br>3. Include a valid authentication token in the request header. |
| **Expected Results** | Execution is blocked by the sandbox before the command can run. System returns 403 Forbidden. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-CR-12: Student submits C code that attempts to read a sensitive server file |
| **Purpose** | Verify that the sandbox environment prevents submitted code from accessing restricted areas of the server file system. |
| **Initiation Criteria** | The sandbox is configured and active. A valid student authentication token is available. |
| **Execution Steps** | 1. Send a POST request to `/code-runner/execute`.<br>2. Provide C code that attempts to open and read `/etc/passwd` along with `"language": "C"` in the request body.<br>3. Include a valid authentication token in the request header. |
| **Expected Results** | File access is blocked by the sandbox. System returns 403 Forbidden. |

---

| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-CR-13: Student submits C code that attempts to create a fork bomb |
| **Purpose** | Verify that the system detects and blocks process multiplication attacks that could exhaust server resources. |
| **Initiation Criteria** | The sandbox is configured and active. A valid student authentication token is available. |
| **Execution Steps** | 1. Send a POST request to `/code-runner/execute`.<br>2. Provide C code that calls fork() in an infinite loop along with `"language": "C"` in the request body.<br>3. Include a valid authentication token in the request header. |
| **Expected Results** | Process creation is blocked by the sandbox. System returns 403 Forbidden. |

---

# FEATURE 8: Attach Challenge to Assignment
 
**User Story:** As a teacher, I want to attach a coding challenge to an assignment so that students can complete programming tasks inside the assignment.
 
---
 
| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-AC-01: Teacher successfully attaches a coding challenge to an assignment |
| **Purpose** | Verify that the API allows a teacher to attach an existing coding challenge to an assignment. |
| **Initiation Criteria** | Classroom exists. Assignment exists within that classroom. Coding challenge exists. A valid teacher authentication token is available. |
| **Execution Steps** | 1. Send a POST request to `/classrooms/{classroomId}/assignments/{assignmentId}/challenge`.<br>2. Provide `{ "challengeId": 1 }` in the request body.<br>3. Include a valid authentication token in the request header. |
| **Expected Results** | API returns 200 OK. Response body confirms the challenge has been attached. Database stores the relationship between the assignment and the challenge. |
 
---
 
| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-AC-02: Teacher tries to attach a challenge using a non-existing challenge ID |
| **Purpose** | Ensure the API handles invalid challenge IDs properly and does not create a broken reference. |
| **Initiation Criteria** | Classroom and assignment exist. No challenge with the provided ID exists. A valid teacher authentication token is available. |
| **Execution Steps** | 1. Send a POST request to `/classrooms/{classroomId}/assignments/{assignmentId}/challenge`.<br>2. Provide a non-existing challengeId (e.g. `{ "challengeId": 999 }`) in the request body.<br>3. Include a valid authentication token in the request header. |
| **Expected Results** | API returns 404 Not Found. Error message indicates the challenge does not exist. No database changes occur. |
 
---
 
| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-AC-03: User attempts to attach a challenge without providing an authentication token |
| **Purpose** | Verify that the API requires authentication before performing the attach action. |
| **Initiation Criteria** | Classroom and assignment exist. Coding challenge exists. No authentication token is present. |
| **Execution Steps** | 1. Send a POST request to `/classrooms/{classroomId}/assignments/{assignmentId}/challenge`.<br>2. Provide a valid challengeId in the request body.<br>3. Do not include any Authorization header in the request. |
| **Expected Results** | API returns 401 Unauthorized. Challenge is not attached to the assignment. |
 
---
 
| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-AC-04: Teacher tries to attach a challenge to an assignment that does not exist |
| **Purpose** | Verify that the API returns a not-found error when the assignment ID in the request path does not exist. |
| **Initiation Criteria** | Classroom exists. No assignment with the provided ID exists. A valid teacher authentication token is available. |
| **Execution Steps** | 1. Send a POST request to `/classrooms/{classroomId}/assignments/999/challenge`.<br>2. Provide a valid challengeId (e.g. `{ "challengeId": 1 }`) in the request body.<br>3. Include a valid authentication token in the request header. |
| **Expected Results** | API returns 404 Not Found with message "Assignment not found". |
 
---
 
| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-AC-05: Teacher removes a coding challenge from an assignment |
| **Purpose** | Verify that the API allows a teacher to detach a challenge that is currently attached to an assignment. |
| **Initiation Criteria** | Assignment exists and already has a coding challenge attached. A valid teacher authentication token is available. |
| **Execution Steps** | 1. Send a DELETE request to `/classrooms/{classroomId}/assignments/{assignmentId}/challenge/{challengeId}`.<br>2. Include a valid authentication token in the request header. |
| **Expected Results** | API returns 200 OK. Challenge is removed from the assignment. Database no longer stores the relationship between the assignment and the challenge. |
 
---
 
| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-AC-06: Teacher tries to remove a challenge that is not attached to the assignment |
| **Purpose** | Ensure the API handles deletion of a non-attached challenge correctly and returns a meaningful error. |
| **Initiation Criteria** | Assignment exists. The specified challenge exists but is not attached to this assignment. A valid teacher authentication token is available. |
| **Execution Steps** | 1. Send a DELETE request to `/classrooms/{classroomId}/assignments/{assignmentId}/challenge/{challengeId}` where the challenge is not attached.<br>2. Include a valid authentication token in the request header. |
| **Expected Results** | API returns 404 Not Found. Error message indicates the challenge is not attached to this assignment. |
 
---
 
| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-AC-07: Teacher deletes a coding challenge that is currently attached to an assignment |
| **Purpose** | Verify system behavior when a teacher attempts to delete a challenge that is linked to an active assignment. The system must protect data integrity by preventing orphaned assignment references. |
| **Initiation Criteria** | A challenge exists and is attached to at least one assignment. A valid teacher authentication token is available. |
| **Execution Steps** | 1. Send a DELETE request to `/challenges/{challengeId}` targeting the challenge that is attached to an assignment.<br>2. Include a valid authentication token in the request header. |
| **Expected Results** | Deletion is prevented to protect the linked assignment. System returns 409 Conflict. |

---

# FEATURE 9: Code Runner - Execute Student Code with Test Cases
 
**User Story:** As a student, I want to run my code against challenge test cases so that I can verify if my solution works correctly.
As a system, I must execute the submitted code against test cases and return pass/fail results.
As a student, I want to receive execution feedback so I can improve my code.
 
**Functional Scenario: Student Runs Code During Assignment**
 
1. Student opens an assignment containing a coding challenge.
2. Student writes code in the editor.
3. Student clicks Run Code.
4. Backend sends request to the Code Runner API.
5. System executes the code with the challenge test cases.
6. System compares output with expected results.
7. System returns pass/fail feedback to the student.
 
---
 
| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-CRE-01: Student runs valid code that passes all test cases |
| **Purpose** | Verify that the system executes student code and returns pass results for a correct solution. |
| **Initiation Criteria** | Student is authenticated. Assignment exists. Coding challenge exists with at least one test case attached. A valid authentication token is available. |
| **Execution Steps** | 1. Send a POST request to `/code-runner/run`.<br>2. Provide `{ "sourceCode": "...", "language": "C", "challengeId": 1 }` in the request body with a correct implementation.<br>3. Include a valid authentication token in the request header. |
| **Expected Results** | API returns 200 OK. Response includes execution output and test results where status is PASS for all test cases. |
 
---
 
| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-CRE-02: Student runs code that produces incorrect output and fails test cases |
| **Purpose** | Verify that the system correctly reports failed test cases when the code output does not match the expected result. |
| **Initiation Criteria** | Student is authenticated. Coding challenge contains at least one test case. A valid authentication token is available. |
| **Execution Steps** | 1. Send a POST request to `/code-runner/run`.<br>2. Provide `{ "sourceCode": "...", "language": "C", "challengeId": 1 }` in the request body with an incorrect implementation that produces wrong output.<br>3. Include a valid authentication token in the request header. |
| **Expected Results** | API returns 200 OK. Response contains test results where status is FAIL. Both expected and actual outputs are returned in the response body. |
 
---
 
| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-CRE-03: User attempts to run code without providing an authentication token |
| **Purpose** | Ensure that only authenticated students can execute code and that unauthenticated requests are blocked. |
| **Initiation Criteria** | Assignment and coding challenge exist. No authentication token is present. |
| **Execution Steps** | 1. Send a POST request to `/code-runner/run`.<br>2. Provide valid source code and language in the request body.<br>3. Do not include any Authorization header in the request. |
| **Expected Results** | API returns 401 Unauthorized. Code execution is not performed. |
 
---
 
| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-CRE-04: Student submits code that contains a syntax error |
| **Purpose** | Verify that the system returns a meaningful compilation error when the submitted code cannot be compiled. |
| **Initiation Criteria** | Student is authenticated. A valid authentication token is available. |
| **Execution Steps** | 1. Send a POST request to `/code-runner/run`.<br>2. Provide code with a syntax error (e.g. missing semicolon) along with a valid language and challengeId in the request body.<br>3. Include a valid authentication token in the request header. |
| **Expected Results** | API returns 422 Unprocessable Entity. Response includes a compiler error message describing the issue. |
 
---
 
| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-CRE-05: Student submits code that contains an infinite loop |
| **Purpose** | Verify that the system enforces an execution time limit and safely terminates programs that run indefinitely. |
| **Initiation Criteria** | Student is authenticated. A valid authentication token is available. |
| **Execution Steps** | 1. Send a POST request to `/code-runner/run`.<br>2. Provide code containing an infinite loop (e.g. `while(1);`) along with a valid language and challengeId in the request body.<br>3. Include a valid authentication token in the request header. |
| **Expected Results** | API returns 408 Request Timeout. Execution is terminated safely after the configured time limit is exceeded. |
 
---
 
| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-CRE-06: Student runs code for a challenge that has no test cases defined |
| **Purpose** | Verify that the system can execute code and return output even when no test cases are attached to the challenge. |
| **Initiation Criteria** | Student is authenticated. A coding challenge exists but has no test cases. A valid authentication token is available. |
| **Execution Steps** | 1. Send a POST request to `/code-runner/run`.<br>2. Provide valid source code, language, and the challengeId of a challenge with no test cases in the request body.<br>3. Include a valid authentication token in the request header. |
| **Expected Results** | API returns 200 OK. Response includes the program execution output and an empty testResults array. |
 
---
 
| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-CRE-07: Student submits a run request with a non-existing challenge ID |
| **Purpose** | Verify that the system handles invalid challenge IDs properly and returns a clear error. |
| **Initiation Criteria** | Student is authenticated. No challenge with the provided ID exists. A valid authentication token is available. |
| **Execution Steps** | 1. Send a POST request to `/code-runner/run`.<br>2. Provide a non-existing challengeId (e.g. `{ "sourceCode": "...", "language": "C", "challengeId": 999 }`) in the request body.<br>3. Include a valid authentication token in the request header. |
| **Expected Results** | API returns 404 Not Found. Error message indicates the challenge does not exist. |
 
---
 
| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-CRE-08: Student submits code in an unsupported programming language |
| **Purpose** | Verify that the system rejects execution requests for languages that are not supported. |
| **Initiation Criteria** | Student is authenticated. A valid authentication token is available. |
| **Execution Steps** | 1. Send a POST request to `/code-runner/run`.<br>2. Provide `{ "sourceCode": "print('hello')", "language": "Python", "challengeId": 1 }` in the request body.<br>3. Include a valid authentication token in the request header. |
| **Expected Results** | API returns 400 Bad Request with the message "Unsupported language". |
 
---
 
| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-CRE-09: Student receives complete execution feedback after running code |
| **Purpose** | Verify that the system provides full execution output and per-test-case evaluation results so the student can understand what passed and what failed. |
| **Initiation Criteria** | Student is authenticated. Coding challenge has multiple test cases attached. A valid authentication token is available. |
| **Execution Steps** | 1. Send a POST request to `/code-runner/run`.<br>2. Provide valid source code, language, and a challengeId that has multiple test cases in the request body.<br>3. Include a valid authentication token in the request header. |
| **Expected Results** | API returns 200 OK. Response body contains: program output, pass/fail status per test case, and expected vs actual output for each test case. |
 
---

# FEATURE 10: Submissions — CRUD Submissions
 
**User Story:**
- US-SUB-01: As a student, I want to submit my solution to a coding challenge so that my work can be evaluated.
- US-SUB-02: As a student, I want to view my submissions so that I can review my past attempts.
- US-SUB-03: As a student, I want to update my submission before the deadline so that I can improve my solution.
- US-SUB-04: As a system, I must store submission results and link them to the assignment, student, and coding challenge.
 
**Functional Scenario: Student Submits Solution**
 
1. Student opens an assignment containing a coding challenge.
2. Student writes code.
3. Student submits the solution.
4. Backend stores submission with status and result.
5. Student can view submission history.
 
---
 
| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-SUB-01: Student successfully creates a submission for a coding challenge |
| **Purpose** | Verify that the API allows a student to submit a solution for a coding challenge inside an assignment. |
| **Initiation Criteria** | Student is authenticated. Assignment exists. Coding challenge exists inside the assignment. A valid authentication token is available. |
| **Execution Steps** | 1. Send a POST request to `/assignments/{assignmentId}/submissions`.<br>2. Provide `{ "challengeId": 1, "sourceCode": "..." }` in the request body.<br>3. Include a valid authentication token in the request header. |
| **Expected Results** | API returns 201 Created. Submission is stored in the database with assignmentId, studentId, challengeId, and sourceCode. |
 
---
 
| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-SUB-02: Student attempts to create a submission without providing an authentication token |
| **Purpose** | Verify that the system requires authentication before allowing submission creation. |
| **Initiation Criteria** | Assignment and coding challenge exist. No authentication token is present. |
| **Execution Steps** | 1. Send a POST request to `/assignments/{assignmentId}/submissions`.<br>2. Provide valid submission data in the request body.<br>3. Do not include any Authorization header in the request. |
| **Expected Results** | API returns 401 Unauthorized. Submission is not created. |
 
---
 
| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-SUB-03: Student submits a request with missing source code |
| **Purpose** | Ensure the API validates request body fields and rejects submissions without required data. |
| **Initiation Criteria** | Student is authenticated. Assignment exists. A valid authentication token is available. |
| **Execution Steps** | 1. Send a POST request to `/assignments/{assignmentId}/submissions`.<br>2. Provide `{ "challengeId": 1 }` in the request body, omitting the sourceCode field.<br>3. Include a valid authentication token in the request header. |
| **Expected Results** | API returns 400 Bad Request with a validation error message indicating that sourceCode is required. |
 
---
 
| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-SUB-04: Teacher retrieves all submissions for a specific assignment |
| **Purpose** | Verify that the API returns all submissions associated with a specific assignment. |
| **Initiation Criteria** | Assignment exists and has multiple submissions stored in the database. A valid authentication token is available. |
| **Execution Steps** | 1. Send a GET request to `/assignments/{assignmentId}/submissions`.<br>2. Include a valid authentication token in the request header. |
| **Expected Results** | API returns 200 OK. Response body contains a list of all submissions associated with the assignment. |
 
---
 
| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-SUB-05: Student retrieves a specific submission by its ID |
| **Purpose** | Verify that the API returns the details of a specific submission when a valid submission ID is provided. |
| **Initiation Criteria** | A submission with a known ID exists in the database. A valid authentication token is available. |
| **Execution Steps** | 1. Send a GET request to `/assignments/{assignmentId}/submissions/{submissionId}`.<br>2. Include a valid authentication token in the request header. |
| **Expected Results** | API returns 200 OK with submission details including source code and execution status. |
 
---
 
| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-SUB-06: Student tries to retrieve a submission using an invalid submission ID |
| **Purpose** | Ensure the API handles non-existing submission IDs correctly and returns a clear error message. |
| **Initiation Criteria** | Assignment exists. No submission with the provided ID exists in the database. A valid authentication token is available. |
| **Execution Steps** | 1. Send a GET request to `/assignments/{assignmentId}/submissions/999`.<br>2. Include a valid authentication token in the request header. |
| **Expected Results** | API returns 404 Not Found with message "Submission not found". |
 
---
 
| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-SUB-07: Student successfully updates an existing submission |
| **Purpose** | Verify that the API allows a student to update the source code of an existing submission. |
| **Initiation Criteria** | Student is authenticated. A submission with a known ID exists. A valid authentication token is available. |
| **Execution Steps** | 1. Send a PUT request to `/assignments/{assignmentId}/submissions/{submissionId}`.<br>2. Provide `{ "sourceCode": "updated code..." }` in the request body.<br>3. Include a valid authentication token in the request header. |
| **Expected Results** | API returns 200 OK. Submission record is updated in the database with the new source code. |
 
---
 
| Test Case Field | Details |
|---|---|
| **Test Case ID: Test Case Name** | TC-SUB-08: Student tries to update a submission that does not exist |
| **Purpose** | Verify that the system handles update requests for non-existing submissions and returns a clear error. |
| **Initiation Criteria** | Assignment exists. No submission with the provided ID exists in the database. A valid authentication token is available. |
| **Execution Steps** | 1. Send a PUT request to `/assignments/{assignmentId}/submissions/999`.<br>2. Provide `{ "sourceCode": "updated code..." }` in the request body.<br>3. Include a valid authentication token in the request header. |
| **Expected Results** | API returns 404 Not Found. Submission update is not performed. |
 
---

