<?php
/** 公開 API：GET news/api.php → 已發布消息（依後台設定的則數）。?all=1 給「更多消息」頁用（最多 50） */
declare(strict_types=1);
require __DIR__ . '/lib.php';
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=60');
$settings = nr_settings();
$limit = isset($_GET['all']) ? 50 : (int) $settings['showCount'];
$items = array_map(function ($i) {
    return [
        'id' => $i['id'], 'title' => $i['title'], 'date' => $i['date'], 'pinned' => (bool) ($i['pinned'] ?? false),
        'html' => $i['html'], 'excerpt' => nr_excerpt($i['html']), 'cover' => nr_first_image($i['html']),
    ];
}, nr_public_items($limit));
echo json_encode([
    'sectionTitle' => $settings['sectionTitle'], 'sectionNote' => $settings['sectionNote'],
    'showCount' => (int) $settings['showCount'], 'total' => count(nr_public_items(50)), 'items' => $items,
], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
