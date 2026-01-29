// Test script to verify bank accounts API
async function testBankAccountsAPI() {
    console.log("\n=== Testing Bank Accounts API ===\n")

    try {
        const response = await fetch("http://localhost:3000/api/accounting/bank-accounts")
        console.log("Status:", response.status)
        console.log("Status Text:", response.statusText)

        const data = await response.json()
        console.log("\nResponse data:", JSON.stringify(data, null, 2))

        if (Array.isArray(data)) {
            console.log(`\n✓ Received ${data.length} accounts`)
            data.forEach((acc, idx) => {
                console.log(`  ${idx + 1}. ${acc.bankName} - ${acc.accountNumber} (${acc.accountName}) - Active: ${acc.isActive}`)
            })
        } else {
            console.log("\n✗ Response is not an array")
        }
    } catch (error) {
        console.error("\n✗ Error:", error)
    }
}

testBankAccountsAPI()
