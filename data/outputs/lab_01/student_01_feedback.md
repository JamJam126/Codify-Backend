# Evaluation Report — student_01
## Assignment: lab_01

---

### ✅ Skill 1 — Be able to shift elements, using arr[i-1] and handle the 1st cell
**Weight: 4 | Status: PASS | Lines 10–12**

You correctly used the left-shift copy pattern inside the loop, and starting at i = 1 keeps arr[i - 1] within bounds. That demonstrates the required shift step for this skill.

**Your correct code:**
```c
for(i = 1; i < 5; i++) {
arr[i - 1] = arr[i];
}
```

---

### ❌ Skill 2 — Avoid losing data during shifting, using a temporary variable
**Weight: 3 | Status: FAIL | Lines 10–13**

**WHAT YOU DID:**
```c
for(i = 1; i < 5; i++) {
arr[i - 1] = arr[i];
}
arr[4] = arr[0];
```

**WHY IT IS WRONG:**
Your loop overwrites the original arr[0] before it is saved, so the value that should move to the last position is lost. A temporary variable is needed to preserve that original first element before shifting.

**HOW TO FIX IT:**
```c
temp = arr[0];
    for (int i = 0; i < 4; i++) {
        arr[i] = arr[i + 1];
    }
    arr[4] = temp;
```

---

### ✅ Skill 3 — Be able to access array elements using index (arr[i])
**Weight: 2 | Status: PASS | Lines 7–7**

You correctly used array index notation to access the intended array element for this operation. That demonstrates the required arr[i] access pattern for this skill.

**Your correct code:**
```c
scanf("%d", &arr[i]);
```

---

### ✅ Skill 4 — Use scanf to read 5 integers into an array
**Weight: 1 | Status: PASS | Lines 6–8**

You correctly used scanf with &arr[i] inside the loop so each input is stored directly in the correct array cell. Running the loop five times matches the requirement to read five integers.

**Your correct code:**
```c
for(i = 0; i < 5; i++) {
scanf("%d", &arr[i]);
}
```

---
