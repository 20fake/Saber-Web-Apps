<?php

$baseUrl = 'http://127.0.0.1:8000/api';

function call($method, $endpoint, $data = [], $token = null) {
    global $baseUrl;
    $url = $baseUrl . $endpoint;
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    
    $headers = ['Accept: application/json', 'Content-Type: application/json'];
    if ($token) {
        $headers[] = 'Authorization: Bearer ' . $token;
    }
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

    if (!empty($data)) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    }

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    return ['code' => $httpCode, 'body' => json_decode($response, true)];
}

echo "1. Registering Client...\n";
$email = 'client' . time() . '@example.com';
$registerData = [
    'name' => 'Test Client',
    'email' => $email,
    'password' => 'password',
    'password_confirmation' => 'password',
    'role' => 'client'
];
$res = call('POST', '/register', $registerData);

if ($res['code'] !== 201) {
    echo "Failed to register: " . json_encode($res['body']) . "\n";
    exit(1);
}

$token = $res['body']['access_token'];
echo "Client Registered. Token: " . substr($token, 0, 10) . "...\n";

echo "2. Getting User Info...\n";
$res = call('GET', '/user', [], $token);
if ($res['code'] !== 200) {
    echo "Failed to get user: " . json_encode($res['body']) . "\n";
    exit(1);
}
echo "User: " . $res['body']['email'] . "\n";

echo "3. Creating Order...\n";
$orderData = [
    'pickup_location' => '123 Pickup St',
    'delivery_location' => '456 Delivery Rd',
    'details' => 'Food package',
];
$res = call('POST', '/orders', $orderData, $token);
if ($res['code'] !== 201) {
    echo "Failed to create order: " . json_encode($res['body']) . "\n";
    exit(1);
}
echo "Order Created: ID " . $res['body']['id'] . "\n";

echo "Backend Verification Successful!\n";
