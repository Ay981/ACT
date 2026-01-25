<?php
// Simple test to verify PHP and Apache are working
echo json_encode([
    'status' => 'ok',
    'php_version' => PHP_VERSION,
    'server' => $_SERVER['SERVER_SOFTWARE'] ?? 'unknown',
    'document_root' => $_SERVER['DOCUMENT_ROOT'] ?? 'unknown',
    'request_uri' => $_SERVER['REQUEST_URI'] ?? 'unknown'
], JSON_PRETTY_PRINT);
