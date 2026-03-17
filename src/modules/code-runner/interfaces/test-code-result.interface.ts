export interface TestCodeResult {
    testCasesId: number;
    passed: boolean;
    status: string;
    actualOutput: string;
    expectedOutput: string;
}