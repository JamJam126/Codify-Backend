# Array Left Shift Assignment

We have an array containing 5 numbers.
Write a program to shift all elements of an array one position to the left.
The first element becomes the last.

## INPUT-OUTPUT
1, 2, 3, 4, 5  ->  2, 3, 4, 5, 1
10, 9, 8, 7, 6  ->  9, 8, 7, 6, 10

## Micro Skills to Evaluate:
- Be able to access array elements using index (arr[i])
- Use scanf to read 5 integers into an array
- Be able to shift elements, using arr[i-1] and handle the 1st cell
- Avoid losing data during shifting, using a temporary variable