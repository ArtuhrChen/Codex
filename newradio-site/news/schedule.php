<?php
/** 公開 API：GET news/schedule.php → 節目表。後台存過就給後台版本，沒有就給 data/schedule.json（自動抓的）。 */
declare(strict_types=1);
require __DIR__ . '/lib.php';
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=60');
echo json_encode(nr_schedule(), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
