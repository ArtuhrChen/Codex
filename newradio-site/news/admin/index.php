<?php
/** 後台首頁：第一次設定密碼 → 登入 → 消息列表 + 顯示設定 */
declare(strict_types=1);
require __DIR__ . '/../lib.php';
nr_session();
$msg = ''; $err = '';

// 第一次使用：設定管理密碼
if (!nr_has_config()) {
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['setup'])) {
        nr_check_csrf();
        $pw = (string) ($_POST['password'] ?? ''); $pw2 = (string) ($_POST['password2'] ?? '');
        if (mb_strlen($pw) < 8) $err = '密碼至少 8 個字。';
        elseif ($pw !== $pw2) $err = '兩次輸入的密碼不一樣。';
        else { nr_set_password($pw); $_SESSION['nr_admin'] = true; header('Location: index.php?setup=ok'); exit; }
    }
    $csrf = nr_csrf();
    nr_page_start('第一次設定');
    echo '<main class="nr-card"><h1>設定後台密碼</h1><p class="nr-help">這是第一次打開後台。請設定一組密碼，之後同事用這組密碼登入發消息。</p>';
    if ($err) echo '<p class="nr-err">' . h($err) . '</p>';
    echo '<form method="post"><input type="hidden" name="csrf" value="' . h($csrf) . '"><input type="hidden" name="setup" value="1">
      <label>密碼（至少 8 個字）<input type="password" name="password" required minlength="8" autocomplete="new-password"></label>
      <label>再輸入一次<input type="password" name="password2" required minlength="8" autocomplete="new-password"></label>
      <button class="nr-btn nr-primary" type="submit">建立密碼並進入後台</button></form></main>';
    nr_page_end(); exit;
}

// 登入
if (!nr_logged_in()) {
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['login'])) {
        nr_check_csrf();
        $_SESSION['tries'] = ($_SESSION['tries'] ?? 0) + 1;
        if ($_SESSION['tries'] > 8) { sleep(3); }
        if (nr_check_password((string) ($_POST['password'] ?? ''))) { session_regenerate_id(true); $_SESSION['nr_admin'] = true; $_SESSION['tries'] = 0; header('Location: index.php'); exit; }
        $err = '密碼不對，再試一次。';
    }
    $csrf = nr_csrf();
    nr_page_start('登入');
    echo '<main class="nr-card"><h1>電台消息報恁知・後台</h1>';
    if ($err) echo '<p class="nr-err">' . h($err) . '</p>';
    echo '<form method="post"><input type="hidden" name="csrf" value="' . h($csrf) . '"><input type="hidden" name="login" value="1">
      <label>密碼<input type="password" name="password" required autocomplete="current-password" autofocus></label>
      <button class="nr-btn nr-primary" type="submit">登入</button></form></main>';
    nr_page_end(); exit;
}

// 已登入：處理設定 / 刪除 / 發布切換
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    nr_check_csrf();
    $action = $_POST['action'] ?? '';
    if ($action === 'settings') {
        $s = nr_settings();
        $s['showCount'] = max(1, min(10, (int) ($_POST['showCount'] ?? 3)));
        $s['sectionTitle'] = trim((string) ($_POST['sectionTitle'] ?? '')) ?: '電台消息報恁知';
        $s['sectionNote'] = trim((string) ($_POST['sectionNote'] ?? ''));
        nr_save_settings($s); $msg = '設定已儲存。';
    } elseif (in_array($action, ['delete', 'toggle', 'pin'], true)) {
        $items = nr_items(); $id = (string) ($_POST['id'] ?? '');
        foreach ($items as $k => $it) {
            if ($it['id'] !== $id) continue;
            if ($action === 'delete') { unset($items[$k]); $msg = '已刪除。'; }
            if ($action === 'toggle') { $items[$k]['published'] = empty($it['published']); $msg = $items[$k]['published'] ? '已發布到官網。' : '已改為草稿（官網不會顯示）。'; }
            if ($action === 'pin') { $items[$k]['pinned'] = empty($it['pinned']); $msg = $items[$k]['pinned'] ? '已置頂。' : '已取消置頂。'; }
        }
        nr_save_items($items);
    } elseif ($action === 'password') {
        $pw = (string) ($_POST['password'] ?? '');
        if (mb_strlen($pw) < 8) $err = '新密碼至少 8 個字。'; else { nr_set_password($pw); $msg = '密碼已更換。'; }
    }
}
if (isset($_GET['setup'])) $msg = '密碼建立好了，歡迎使用。先按「寫一則新消息」試試看。';
if (isset($_GET['saved'])) $msg = '消息已儲存。';

$settings = nr_settings(); $items = nr_items(); $csrf = nr_csrf();
usort($items, fn($a, $b) => strcmp($b['date'] ?? '', $a['date'] ?? ''));
$publishedCount = count(array_filter($items, fn($i) => !empty($i['published'])));

nr_page_start('消息列表');
?>
<main class="nr-wrap">
  <header class="nr-top">
    <div><h1>電台消息報恁知・後台</h1><p class="nr-help">官網目前顯示最新 <strong><?= (int) $settings['showCount'] ?></strong> 則，已發布共 <?= $publishedCount ?> 則。</p></div>
    <div class="nr-actions"><a class="nr-btn nr-primary nr-big" href="edit.php">＋ 寫一則新消息</a> <a class="nr-btn" href="../index.html#news" target="_blank">看官網</a> <a class="nr-btn nr-quiet" href="logout.php">登出</a></div>
  </header>
  <?php if ($msg): ?><p class="nr-ok"><?= h($msg) ?></p><?php endif; ?>
  <?php if ($err): ?><p class="nr-err"><?= h($err) ?></p><?php endif; ?>

  <section class="nr-card">
    <h2>消息列表</h2>
    <?php if (!$items): ?><p class="nr-help">還沒有消息。按右上角「寫一則新消息」開始。</p><?php endif; ?>
    <ul class="nr-list">
      <?php foreach ($items as $it): $cover = nr_first_image($it['html']); ?>
      <li class="<?= empty($it['published']) ? 'is-draft' : '' ?>">
        <div class="nr-thumb"><?php if ($cover): ?><img src="../<?= h(str_replace('../', '', $cover)) ?>" alt=""><?php else: ?><span>📰</span><?php endif; ?></div>
        <div class="nr-meta">
          <strong><?= h($it['title']) ?></strong>
          <small><?= h(str_replace('-', '.', $it['date'])) ?> ・ <?= empty($it['published']) ? '草稿（官網不顯示）' : '已發布' ?><?= !empty($it['pinned']) ? ' ・ 置頂' : '' ?></small>
          <span class="nr-excerpt"><?= h(nr_excerpt($it['html'], 60)) ?></span>
        </div>
        <div class="nr-row-actions">
          <a class="nr-btn" href="edit.php?id=<?= h($it['id']) ?>">編輯</a>
          <form method="post"><input type="hidden" name="csrf" value="<?= h($csrf) ?>"><input type="hidden" name="id" value="<?= h($it['id']) ?>"><input type="hidden" name="action" value="toggle"><button class="nr-btn" type="submit"><?= empty($it['published']) ? '發布' : '改成草稿' ?></button></form>
          <form method="post"><input type="hidden" name="csrf" value="<?= h($csrf) ?>"><input type="hidden" name="id" value="<?= h($it['id']) ?>"><input type="hidden" name="action" value="pin"><button class="nr-btn nr-quiet" type="submit"><?= empty($it['pinned']) ? '置頂' : '取消置頂' ?></button></form>
          <form method="post" onsubmit="return confirm('確定要刪除「<?= h($it['title']) ?>」嗎？刪了就找不回來。')"><input type="hidden" name="csrf" value="<?= h($csrf) ?>"><input type="hidden" name="id" value="<?= h($it['id']) ?>"><input type="hidden" name="action" value="delete"><button class="nr-btn nr-danger" type="submit">刪除</button></form>
        </div>
      </li>
      <?php endforeach; ?>
    </ul>
  </section>

  <section class="nr-card nr-two">
    <form method="post">
      <h2>官網顯示設定</h2>
      <input type="hidden" name="csrf" value="<?= h($csrf) ?>"><input type="hidden" name="action" value="settings">
      <label>首頁顯示幾則最新消息
        <select name="showCount"><?php for ($i = 1; $i <= 10; $i++): ?><option value="<?= $i ?>" <?= $i === (int) $settings['showCount'] ? 'selected' : '' ?>><?= $i ?> 則</option><?php endfor; ?></select>
      </label>
      <label>區塊標題<input type="text" name="sectionTitle" value="<?= h($settings['sectionTitle']) ?>"></label>
      <label>區塊說明（一句話）<input type="text" name="sectionNote" value="<?= h($settings['sectionNote']) ?>"></label>
      <button class="nr-btn nr-primary" type="submit">儲存設定</button>
    </form>
    <form method="post">
      <h2>更換後台密碼</h2>
      <input type="hidden" name="csrf" value="<?= h($csrf) ?>"><input type="hidden" name="action" value="password">
      <label>新密碼（至少 8 個字）<input type="password" name="password" minlength="8" autocomplete="new-password"></label>
      <button class="nr-btn" type="submit">更換密碼</button>
    </form>
  </section>
</main>
<?php nr_page_end();

function nr_page_start(string $title): void {
    echo '<!doctype html><html lang="zh-Hant-TW"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>' . h($title) . '｜電台消息報恁知 後台</title><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700;800&display=swap"><link rel="stylesheet" href="../news.css"></head><body class="nr-admin">';
}
function nr_page_end(): void { echo '</body></html>'; }
