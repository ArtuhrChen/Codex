<?php
/** 圖片上傳：只收 png/jpg/webp/gif，檢查真實格式，改成亂數檔名，回傳 JSON {url} */
declare(strict_types=1);
require __DIR__ . '/../lib.php';
header('Content-Type: application/json; charset=utf-8');
if (!nr_logged_in()) { http_response_code(401); echo json_encode(['error' => '請先登入']); exit; }
nr_session();
if (!isset($_POST['csrf']) || !hash_equals($_SESSION['csrf'] ?? '', (string) $_POST['csrf'])) { http_response_code(400); echo json_encode(['error' => '表單過期，請重新整理']); exit; }
if (empty($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) { http_response_code(400); echo json_encode(['error' => '沒有收到檔案']); exit; }
$f = $_FILES['file'];
if ($f['size'] > NR_MAX_UPLOAD) { http_response_code(400); echo json_encode(['error' => '圖片太大，請小於 6MB']); exit; }
$info = @getimagesize($f['tmp_name']);
$map = [IMAGETYPE_PNG => 'png', IMAGETYPE_JPEG => 'jpg', IMAGETYPE_WEBP => 'webp', IMAGETYPE_GIF => 'gif'];
if (!$info || !isset($map[$info[2]])) { http_response_code(400); echo json_encode(['error' => '只能上傳 PNG、JPG、WebP、GIF 圖片']); exit; }
if (!is_dir(NR_UPLOADS)) mkdir(NR_UPLOADS, 0755, true);
$name = date('Ymd') . '-' . bin2hex(random_bytes(5)) . '.' . $map[$info[2]];
if (!move_uploaded_file($f['tmp_name'], NR_UPLOADS . '/' . $name)) { http_response_code(500); echo json_encode(['error' => '存檔失敗，請確認 uploads 資料夾可寫入']); exit; }
// 太大的圖片縮到 1600px 寬（有 GD 才做）
if (function_exists('imagecreatefromstring') && $info[0] > 1600 && $map[$info[2]] !== 'gif') {
    $src = @imagecreatefromstring(file_get_contents(NR_UPLOADS . '/' . $name));
    if ($src) {
        $w = 1600; $h = (int) round($info[1] * 1600 / $info[0]);
        $dst = imagecreatetruecolor($w, $h); imagealphablending($dst, false); imagesavealpha($dst, true);
        imagecopyresampled($dst, $src, 0, 0, 0, 0, $w, $h, $info[0], $info[1]);
        if ($map[$info[2]] === 'png') imagepng($dst, NR_UPLOADS . '/' . $name, 7);
        elseif ($map[$info[2]] === 'webp') imagewebp($dst, NR_UPLOADS . '/' . $name, 86);
        else imagejpeg($dst, NR_UPLOADS . '/' . $name, 86);
        imagedestroy($dst); imagedestroy($src);
    }
}
echo json_encode(['url' => 'uploads/' . $name, 'width' => min($info[0], 1600)]);
