<?php
/**
 * 電台消息報恁知 — 共用函式（儲存、登入、CSRF、HTML 清洗）
 * 沒有資料庫：消息存 data/news.json，設定存 data/settings.json，圖片存 uploads/。
 * 第一次使用：開 admin/ 會要求設定管理密碼，密碼雜湊寫到 data/config.php。
 */
declare(strict_types=1);
date_default_timezone_set('Asia/Taipei'); // 消息日期、節目表時間戳一律台北時間，不看主機時區

const NR_ROOT = __DIR__;
const NR_DATA = __DIR__ . '/data';
const NR_UPLOADS = __DIR__ . '/uploads';
const NR_EMOJI = __DIR__ . '/emoji';
const NR_MAX_UPLOAD = 6 * 1024 * 1024; // 6MB

function nr_config_path(): string { return NR_DATA . '/config.php'; }
function nr_has_config(): bool { return is_file(nr_config_path()); }
function nr_config(): array { return nr_has_config() ? (include nr_config_path()) : []; }

function nr_read_json(string $file, $default) {
    if (!is_file($file)) return $default;
    $raw = file_get_contents($file);
    if ($raw === '' || $raw === false) return $default;
    $data = json_decode($raw, true);
    // 檔案存在但壞掉（例如寫到一半）：寧可報錯，也不要當成「沒有消息」然後下一次存檔把全部蓋掉
    if (!is_array($data)) throw new RuntimeException('資料檔 ' . basename($file) . ' 讀不出來，請先備份它再處理，不要再存檔。');
    return $data;
}
function nr_write_json(string $file, $data): void {
    if (!is_dir(dirname($file)) && !mkdir(dirname($file), 0755, true)) throw new RuntimeException('建不了資料夾 ' . dirname($file) . '，請檢查寫入權限。');
    $tmp = $file . '.' . bin2hex(random_bytes(4)) . '.tmp';   // 暫存檔名隨機，兩個人同時存不會互踩
    $json = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
    if ($json === false || file_put_contents($tmp, $json, LOCK_EX) === false || !rename($tmp, $file)) {
        @unlink($tmp);
        throw new RuntimeException('存檔失敗：' . basename($file) . ' 寫不進去，請確認 news/data 資料夾可寫入（權限 755 或 775）。');
    }
}
function nr_items(): array { return nr_read_json(NR_DATA . '/news.json', []); }
function nr_save_items(array $items): void { nr_write_json(NR_DATA . '/news.json', array_values($items)); }
function nr_settings(): array {
    return array_merge(['showCount' => 3, 'sectionTitle' => '電台消息報恁知', 'sectionNote' => '電台大小事，第一手告訴你。'], nr_read_json(NR_DATA . '/settings.json', []));
}
function nr_save_settings(array $s): void { nr_write_json(NR_DATA . '/settings.json', $s); }

/** 公開用：已發布的消息，置頂優先、再依日期新到舊，最多 showCount 則 */
function nr_public_items(?int $limit = null): array {
    $items = array_filter(nr_items(), fn($i) => !empty($i['published']));
    usort($items, function ($a, $b) {
        if (($a['pinned'] ?? false) !== ($b['pinned'] ?? false)) return ($b['pinned'] ?? false) <=> ($a['pinned'] ?? false);
        return strcmp($b['date'] ?? '', $a['date'] ?? '');
    });
    $limit = $limit ?? (int) nr_settings()['showCount'];
    return array_slice(array_values($items), 0, max(1, min(50, $limit)));
}

/* ---------------- 登入 ---------------- */
function nr_session(): void {
    if (session_status() === PHP_SESSION_NONE) {
        session_set_cookie_params(['httponly' => true, 'samesite' => 'Lax', 'secure' => !empty($_SERVER['HTTPS'])]);
        session_name('nrnews');
        session_start();
    }
}
/** 登入狀態同時比對「密碼版本」：換過密碼，舊的登入立刻失效（外人就算曾經登進來也會被踢掉） */
function nr_logged_in(): bool {
    nr_session();
    if (empty($_SESSION['nr_admin'])) return false;
    $ver = nr_config()['ver'] ?? '';
    return $ver === '' || ($_SESSION['nr_pwv'] ?? '') === $ver;
}
function nr_mark_logged_in(): void { nr_session(); session_regenerate_id(true); $_SESSION['nr_admin'] = true; $_SESSION['nr_pwv'] = nr_config()['ver'] ?? ''; }
/** 猜密碼節流：記在檔案裡（換 cookie 也躲不掉）。15 分鐘內錯 5 次以上，之後每次都要等 3 秒；錯 30 次直接擋到時間過。 */
function nr_login_throttle_path(): string { return NR_DATA . '/login_fail.json'; }
function nr_login_blocked(): bool {
    try { $f = nr_read_json(nr_login_throttle_path(), []); } catch (Throwable $e) { $f = []; }
    if (empty($f['first']) || time() - (int) $f['first'] > 900) return false;
    $n = (int) ($f['count'] ?? 0);
    if ($n >= 30) return true;
    if ($n >= 5) sleep(3);
    return false;
}
function nr_login_failed(): void {
    try { $f = nr_read_json(nr_login_throttle_path(), []); } catch (Throwable $e) { $f = []; }
    if (empty($f['first']) || time() - (int) $f['first'] > 900) $f = ['first' => time(), 'count' => 0];
    $f['count'] = (int) ($f['count'] ?? 0) + 1;
    try { nr_write_json(nr_login_throttle_path(), $f); } catch (Throwable $e) {}
}
function nr_login_succeeded(): void { @unlink(nr_login_throttle_path()); }
function nr_require_login(): void {
    if (!nr_logged_in()) { header('Location: index.php'); exit; }
}
function nr_check_password(string $pw): bool {
    $cfg = nr_config();
    return isset($cfg['hash']) && password_verify($pw, $cfg['hash']);
}
function nr_set_password(string $pw): void {
    if (!is_dir(NR_DATA)) mkdir(NR_DATA, 0755, true);
    $php = "<?php\nreturn " . var_export(['hash' => password_hash($pw, PASSWORD_DEFAULT), 'ver' => bin2hex(random_bytes(6)), 'created' => date('c')], true) . ";\n";
    if (file_put_contents(nr_config_path(), $php, LOCK_EX) === false) throw new RuntimeException('密碼檔寫不進去，請確認 news/data 資料夾可寫入。');
    if (function_exists('opcache_invalidate')) @opcache_invalidate(nr_config_path(), true);
}
function nr_csrf(): string {
    nr_session();
    if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(16));
    return $_SESSION['csrf'];
}
function nr_check_csrf(): void {
    nr_session();
    if (!isset($_POST['csrf']) || !hash_equals($_SESSION['csrf'] ?? '', (string) $_POST['csrf'])) {
        http_response_code(400); exit('表單已過期，請重新整理後再試一次。');
    }
}

/* ---------------- HTML 清洗（允許清單）---------------- */
function nr_sanitize(string $html): string {
    $allowedTags = ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'ul', 'ol', 'li', 'a', 'img', 'h3', 'h4', 'blockquote', 'span', 'div', 'figure', 'figcaption'];
    $doc = new DOMDocument('1.0', 'UTF-8');
    libxml_use_internal_errors(true);
    $doc->loadHTML('<?xml encoding="UTF-8"><div id="nr-root">' . $html . '</div>', LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
    libxml_clear_errors();
    $root = $doc->getElementById('nr-root');
    if (!$root) return '';
    $walk = function (DOMNode $node) use (&$walk, $allowedTags) {
        $children = [];
        foreach ($node->childNodes as $c) $children[] = $c;
        foreach ($children as $c) {
            if ($c instanceof DOMElement) {
                $tag = strtolower($c->tagName);
                if (!in_array($tag, $allowedTags, true)) {
                    // 不允許的標籤：script/style 整個拿掉，其餘保留文字
                    if (in_array($tag, ['script', 'style', 'iframe', 'object', 'embed'], true)) { $node->removeChild($c); continue; }
                    while ($c->firstChild) $node->insertBefore($c->firstChild, $c);
                    $node->removeChild($c); continue;
                }
                $attrs = [];
                foreach ($c->attributes as $a) $attrs[] = $a->name;
                foreach ($attrs as $name) {
                    $val = $c->getAttribute($name);
                    $keep = false;
                    if ($tag === 'a' && $name === 'href' && preg_match('~^(https?://|mailto:|tel:|#|/)~i', $val)) $keep = true;
                    if ($tag === 'img' && $name === 'src' && preg_match('~^(uploads/|emoji/|\.\./news/uploads/|\.\./news/emoji/|news/uploads/|news/emoji/)[A-Za-z0-9._/-]+$~', $val)) $keep = true;
                    if ($tag === 'img' && in_array($name, ['alt', 'width', 'height', 'data-emoji'], true)) $keep = true;
                    if ($name === 'class' && preg_match('~^[a-z0-9 _-]*$~i', $val)) $keep = true;
                    if (!$keep) $c->removeAttribute($name);
                }
                if ($tag === 'a') { $c->setAttribute('rel', 'noopener'); if (strpos($c->getAttribute('href'), 'http') === 0) $c->setAttribute('target', '_blank'); }
                $walk($c);
            } elseif (!($c instanceof DOMText)) {
                $node->removeChild($c);
            }
        }
    };
    $walk($root);
    $out = '';
    foreach ($root->childNodes as $c) $out .= $doc->saveHTML($c);
    return trim($out);
}

/** 純文字摘要（給列表與 og:description） */
function nr_excerpt(string $html, int $len = 80): string {
    $t = trim(preg_replace('/\s+/u', ' ', html_entity_decode(strip_tags($html), ENT_QUOTES, 'UTF-8')));
    return mb_strlen($t) > $len ? mb_substr($t, 0, $len) . '…' : $t;
}
/** 文內第一張非表情的圖片當封面 */
function nr_first_image(string $html): string {
    if (preg_match_all('~<img[^>]+src="([^"]+)"[^>]*>~i', $html, $m)) {
        foreach ($m[1] as $src) if (strpos($src, 'emoji/') === false) return $src;
    }
    return '';
}
/* ---------------- 節目表（後台版本優先，沒有就退回 data/schedule.json）---------------- */
const NR_SCHEDULE_URL = 'https://www.newradio.com.tw/ForApp/%E7%AF%80%E7%9B%AE%E5%96%AE/%E9%9B%B2%E7%AB%AF%E6%96%B0%E7%AF%80%E7%9B%AE%E8%A1%A8/';
function nr_schedule_admin_path(): string { return NR_DATA . '/schedule.json'; }
function nr_schedule_auto_path(): string { return dirname(NR_ROOT) . '/data/schedule.json'; }
function nr_schedule(): array {
    $s = nr_read_json(nr_schedule_admin_path(), null);
    if ($s === null) $s = nr_read_json(nr_schedule_auto_path(), ['weekday' => [], 'sunday' => [], 'hosts' => []]);
    return $s;
}
/** 把表單送來的一組時段整理乾淨：去空列、驗時間、依開始時間排序 */
function nr_schedule_clean(array $rows): array {
    $out = [];
    foreach ($rows as $r) {
        $title = trim((string) ($r['title'] ?? ''));
        $start = trim((string) ($r['start'] ?? '')); $end = trim((string) ($r['end'] ?? ''));
        if ($title === '' && $start === '' && $end === '') continue;
        if (!preg_match('/^\d{1,2}:\d{2}$/', $start)) $start = '';
        if (!preg_match('/^\d{1,2}:\d{2}$/', $end)) $end = '';
        $start = $start === '' ? '' : sprintf('%02d:%02d', ...array_map('intval', explode(':', $start)));
        $end = $end === '' ? '' : sprintf('%02d:%02d', ...array_map('intval', explode(':', $end)));
        $hosts = array_values(array_filter(array_map('trim', preg_split('/[、,，\/]/u', (string) ($r['hosts'] ?? ''))), fn($h) => $h !== ''));
        $out[] = ['start' => $start, 'end' => $end, 'title' => $title, 'hosts' => $hosts,
                  'summary' => trim((string) ($r['summary'] ?? '')), 'rerun' => !empty($r['rerun']) || strpos($title, '重播') !== false];
    }
    usort($out, fn($a, $b) => strcmp($a['start'], $b['start']));
    return $out;
}
function nr_min(string $t): int { if ($t === '') return -1; [$h, $m] = explode(':', $t); $v = (int) $h * 60 + (int) $m; return $v === 0 && (int) $h === 24 ? 1440 : $v; }
/** 回傳人看得懂的警告：缺時間、結束早於開始、重疊、空檔 */
function nr_schedule_warnings(array $slots, string $dayLabel): array {
    $w = [];
    $prevEnd = null; $prevTitle = '';
    foreach ($slots as $s) {
        $label = $dayLabel . '「' . ($s['title'] ?: '（沒有名稱）') . '」';
        if ($s['start'] === '' || $s['end'] === '') { $w[] = $label . ' 的開始或結束時間沒填。'; continue; }
        if ($s['title'] === '') $w[] = $dayLabel . ' ' . $s['start'] . ' 這個時段沒有節目名稱。';
        $a = nr_min($s['start']); $b = nr_min($s['end']); if ($b === 0) $b = 1440;
        if ($b <= $a) $w[] = $label . ' 結束時間（' . $s['end'] . '）沒有晚於開始時間（' . $s['start'] . '）。';
        if ($prevEnd !== null) {
            if ($a < $prevEnd) $w[] = $dayLabel . '「' . $prevTitle . '」和「' . ($s['title'] ?: $s['start']) . '」時間重疊。';
            elseif ($a > $prevEnd) $w[] = $dayLabel . ' ' . sprintf('%02d:%02d', intdiv($prevEnd, 60), $prevEnd % 60) . ' 到 ' . $s['start'] . ' 之間是空檔，「現在播出」在這段會顯示不出節目。';
        }
        $prevEnd = max($b, $prevEnd ?? 0); $prevTitle = $s['title'] ?: $s['start'];
    }
    if ($slots && $prevEnd !== null && $prevEnd < 1440) $w[] = $dayLabel . ' 最後一檔結束後到午夜是空檔。';
    if ($slots && nr_min($slots[0]['start']) > 0) $w[] = $dayLabel . ' 午夜到第一檔開始之間是空檔。';
    return $w;
}
/** 主持人清單：依節目表出場順序整理，給首頁「主持人」區用 */
function nr_schedule_hosts(array $weekday, array $sunday): array {
    $hosts = [];
    foreach ([$weekday, $sunday] as $list) foreach ($list as $s) foreach ($s['hosts'] as $h) {
        $hosts[$h] = $hosts[$h] ?? ['name' => $h, 'shows' => []];
        $label = str_replace('-重播', '', $s['title']);
        if ($label !== '' && !in_array($label, $hosts[$h]['shows'], true)) $hosts[$h]['shows'][] = $label;
    }
    return array_values($hosts);
}
function nr_save_schedule(array $weekday, array $sunday, string $source = 'admin'): void {
    nr_write_json(nr_schedule_admin_path(), [
        'source' => $source, 'generatedAt' => date('c'), 'timezone' => 'Asia/Taipei',
        'weekday' => $weekday, 'sunday' => $sunday, 'hosts' => nr_schedule_hosts($weekday, $sunday),
    ]);
}
/** 從官方「雲端新節目表」頁抓 JSON 區塊（邏輯同 tools/build-data.py）。失敗丟 RuntimeException。 */
function nr_schedule_import(): array {
    $ctx = stream_context_create(['http' => ['timeout' => 25, 'header' => "User-Agent: Mozilla/5.0 (newradio-site admin import)\r\n"]]);
    $page = @file_get_contents(NR_SCHEDULE_URL, false, $ctx);
    if ($page === false || $page === '') throw new RuntimeException('連不到官方節目表頁面，請稍後再試。');
    $text = html_entity_decode(preg_replace('/<[^>]+>/', "\n", $page), ENT_QUOTES | ENT_HTML5, 'UTF-8');
    if (!preg_match('/\{\s*"周一至周六".*?"圖片對應表"\s*:\s*\{.*?\}\s*\}/su', $text, $m)) throw new RuntimeException('官方節目表頁面裡找不到節目資料，格式可能變了。');
    $raw = json_decode($m[0], true);
    if (!is_array($raw) || empty($raw['周一至周六']) || empty($raw['週日'])) throw new RuntimeException('官方節目表資料讀不出來。');
    $norm = function (array $items): array {
        $rows = [];
        foreach ($items as $it) {
            $t = array_map('trim', explode('-', (string) ($it['時間'] ?? ''), 2));
            $rows[] = ['start' => $t[0] ?? '', 'end' => $t[1] ?? '', 'title' => (string) ($it['節目'] ?? ''),
                       'hosts' => (string) ($it['主持人'] ?? ''), 'summary' => (string) ($it['主旨'] ?? '')];
        }
        return nr_schedule_clean($rows);
    };
    return ['weekday' => $norm($raw['周一至周六']), 'sunday' => $norm($raw['週日'])];
}

function nr_id(): string { return date('Ymd') . '-' . substr(bin2hex(random_bytes(4)), 0, 6); }
function h(?string $s): string { return htmlspecialchars((string) $s, ENT_QUOTES, 'UTF-8'); }
