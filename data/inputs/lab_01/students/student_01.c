#include <stdio.h>
int main() {
    int arr[5];
    int i;
    printf("Enter 5 numbers:\n");
    for(i = 0; i < 5; i++) {
        scanf("%d", &arr[i]);
    }
    
    for(i = 1; i < 5; i++) {
        arr[i - 1] = arr[i];
    }
    arr[4] = arr[0];
    printf("{");
    for(i = 0; i < 5; i++) {
        printf("%d", arr[i]);
        if(i < 4) printf(", ");
    }
    printf("}");
    return 0;
}