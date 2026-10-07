<?php
/**
 * 電台消息報恁知 — 共用函式（儲存、登入、CSRF、HTML 清洗）
 * 沒有資料庫：消息存 data/news.json，設定存 data/settings.json，圖片存 uploads/。
 * 第一次使用：開 admin/ 會要求設定管理密碼，密碼雜湊寫到 data/config.php。
 */
declare(strict_types=1);

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
    $data = json_decode($raw, true);
    return is_array($data) ? $data : $default;
}
function nr_write_json(string $file, $data): void {
    if (!is_dir(dirname($file))) mkdir(dirname($file), 0755, true);
    $tmp = $file . '.tmp';
    file_put_contents($tmp, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT), LOCK_EX);
    rename($tmp, $file);
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
    return array_slice(array_values($items), 0, max(1, min(20, $limit)));
}

/* ---------------- 登入 ---------------- */
function nr_session(): void {
    if (session_status() === PHP_SESSION_NONE) {
        session_set_cookie_params(['httponly' => true, 'samesite' => 'Lax', 'secure' => !empty($_SERVER['HTTPS'])]);
        session_name('nrnews');
        session_start();
    }
}
function nr_logged_in(): bool { nr_session(); return !empty($_SESSION['nr_admin']); }
function nr_require_login(): void {
    if (!nr_logged_in()) { header('Location: index.php'); exit; }
}
function nr_check_password(string $pw): bool {
    $cfg = nr_config();
    return isset($cfg['hash']) && password_verify($pw, $cfg['hash']);
}
function nr_set_password(string $pw): void {
    if (!is_dir(NR_DATA)) mkdir(NR_DATA, 0755, true);
    $php = "<?php\nreturn " . var_export(['hash' => password_hash($pw, PASSWORD_DEFAULT), 'created' => date('c')], true) . ";\n";
    file_put_contents(nr_config_path(), $php, LOCK_EX);
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
                if ($tag === 'a') { $c->setAttribute('rel', 'noopener'); if (str_starts_with($c->getAttribute('href'), 'http')) $c->setAttribute('target', '_blank'); }
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
        foreach ($m[1] as $src) if (!str_contains($src, 'emoji/')) return $src;
    }
    return '';
}
function nr_id(): string { return date('Ymd') . '-' . substr(bin2hex(random_bytes(4)), 0, 6); }
function h(?string $s): string { return htmlspecialchars((string) $s, ENT_QUOTES, 'UTF-8'); }
