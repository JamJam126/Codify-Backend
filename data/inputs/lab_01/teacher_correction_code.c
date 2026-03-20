#include <stdio.h>

int main() {
    int arr[5];
    int temp;

    // 1. Input array
    printf("Enter 5 numbers:\n");
    for (int i = 0; i < 5; i++) {
        scanf("%d", &arr[i]);
    }

    // 2. Shift elements to the left
    temp = arr[0];
    for (int i = 0; i < 4; i++) {
        arr[i] = arr[i + 1];
    }
    arr[4] = temp;

    // 3. Output result
    printf("{");
    for (int i = 0; i < 5; i++) {
        printf("%d", arr[i]);
        if (i < 4) {
            printf(", ");
        }
    }
    printf("}\n");

    return 0;
}