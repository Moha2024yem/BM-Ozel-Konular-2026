
$baseUrl = "http://localhost:3000/api"

Write-Host "--- 1. Testing Customers ---" -ForegroundColor Cyan
# Create
$customerBody = @{
    firstName = "Test"
    lastName = "User"
    email = "test.api@example.com"
    phone = "05559998877"
    address = "API Test Street"
} | ConvertTo-Json
$customer = Invoke-RestMethod -Uri "$baseUrl/customers" -Method Post -ContentType "application/json" -Body $customerBody
$customerId = $customer.data.id
Write-Host "Created Customer ID: $customerId"

# Update
$updateBody = @{ lastName = "Updated" } | ConvertTo-Json
Invoke-RestMethod -Uri "$baseUrl/customers/$customerId" -Method Put -ContentType "application/json" -Body $updateBody
Write-Host "Updated Customer $customerId"

# List
$customers = Invoke-RestMethod -Uri "$baseUrl/customers?limit=1" -Method Get
Write-Host "Total Customers in DB: $($customers.data.pagination.total)"

Write-Host "`n--- 2. Testing Products ---" -ForegroundColor Cyan
# Create
$productBody = @{
    name = "Test Product"
    sku = "TEST-SKU-$(Get-Random)"
    basePrice = 100
    stockQuantity = 50
} | ConvertTo-Json
$product = Invoke-RestMethod -Uri "$baseUrl/products" -Method Post -ContentType "application/json" -Body $productBody
$productId = $product.data.id
Write-Host "Created Product ID: $productId"

# Update Stock
$stockBody = @{ quantity = 10; operation = "add" } | ConvertTo-Json
Invoke-RestMethod -Uri "$baseUrl/products/$productId/stock" -Method Patch -ContentType "application/json" -Body $stockBody
Write-Host "Added stock to Product $productId"

Write-Host "`n--- 3. Testing Orders ---" -ForegroundColor Cyan
# Create Order
$orderBody = @{
    customerId = $customerId
    items = @(
        @{ productId = $productId; quantity = 2 }
    )
} | ConvertTo-Json
$order = Invoke-RestMethod -Uri "$baseUrl/orders" -Method Post -ContentType "application/json" -Body $orderBody
$orderId = $order.data.id
Write-Host "Created Order ID: $orderId"

# Update Status
$statusBody = @{ status = "shipped" } | ConvertTo-Json
Invoke-RestMethod -Uri "$baseUrl/orders/$orderId/status" -Method Patch -ContentType "application/json" -Body $statusBody
Write-Host "Updated Order Status to shipped"

Write-Host "`n--- 4. Cleanup & List ---" -ForegroundColor Cyan
# List Orders
$orders = Invoke-RestMethod -Uri "$baseUrl/orders?limit=1" -Method Get
Write-Host "Total Orders in DB: $($orders.data.pagination.total)"

# Delete (Deactivate) Customer
Invoke-RestMethod -Uri "$baseUrl/customers/$customerId" -Method Delete
Write-Host "Deactivated Customer $customerId"

Write-Host "`nTEST COMPLETED SUCCESSFULLY" -ForegroundColor Green
