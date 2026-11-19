<?php

use Illuminate\Contracts\Console\Kernel;

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();

echo "=== DATABASE TABLES ===\n";
$tables = DB::select('SHOW TABLES');
echo 'Total: '.count($tables)."\n\n";

foreach ($tables as $table) {
    $tableName = array_values((array) $table)[0];
    echo "- {$tableName}\n";
}

echo "\n=== MODELS ===\n";
$modelPath = __DIR__.'/app/Models';
$models = array_diff(scandir($modelPath), ['.', '..', 'Concerns', 'Scopes']);
foreach ($models as $model) {
    if (pathinfo($model, PATHINFO_EXTENSION) === 'php') {
        echo '- '.pathinfo($model, PATHINFO_FILENAME)."\n";
    }
}

echo "\n=== CONTROLLERS ===\n";
$controllerPath = __DIR__.'/app/Http/Controllers';
$controllers = array_diff(scandir($controllerPath), ['.', '..', 'Api', 'Auth', 'Http']);
foreach ($controllers as $controller) {
    if (pathinfo($controller, PATHINFO_EXTENSION) === 'php') {
        echo '- '.pathinfo($controller, PATHINFO_FILENAME)."\n";
    }
}
