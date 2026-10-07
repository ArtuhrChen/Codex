<?php
/**
 * 產生後台密碼設定檔 news/data/config.php（密碼只存加密後的雜湊，不存明文）
 * 用法：php tools/make-password.php '你的密碼'
 * 產出的檔案不要放進 GitHub，直接上傳到主機的 news/data/ 即可。
 */
$pw = $argv[1] ?? '';
if (mb_strlen($pw) < 8) { fwrite(STDERR, "密碼至少 8 個字\n"); exit(1); }
$dir = __DIR__ . '/../news/data';
if (!is_dir($dir)) mkdir($dir, 0755, true);
$php = "<?php\nreturn " . var_export(['hash' => password_hash($pw, PASSWORD_DEFAULT), 'created' => date('c')], true) . ";\n";
file_put_contents($dir . '/config.php', $php, LOCK_EX);
echo "已產生 " . realpath($dir . '/config.php') . "\n";
