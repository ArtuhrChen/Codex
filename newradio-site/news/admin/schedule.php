<?php
/** 節目表後台：編輯平日／週日每個時段，或一鍵從官方節目表頁匯入。存檔後首頁「現在播出」立刻改讀這份。 */
declare(strict_types=1);
require __DIR__ . '/../lib.php';
nr_require_login();
$csrf = nr_csrf();
$msg = ''; $err = ''; $warnings = [];
$sched = nr_schedule();
$weekday = $sched['weekday'] ?? []; $sunday = $sched['sunday'] ?? [];
$usingAdmin = is_file(nr_schedule_admin_path());

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    nr_check_csrf();
    $action = $_POST['action'] ?? '';
    if ($action === 'save') {
        $weekday = nr_schedule_clean($_POST['weekday'] ?? []);
        $sunday = nr_schedule_clean($_POST['sunday'] ?? []);
        if (!$weekday && !$sunday) $err = '節目表是空的，沒有儲存。至少要有一個時段。';
        else {
            nr_save_schedule($weekday, $sunday);
            $usingAdmin = true; $sched = nr_schedule();
            $warnings = array_merge(nr_schedule_warnings($weekday, '平日'), nr_schedule_warnings($sunday, '週日'));
            $msg = '節目表已儲存，官網「現在播出」與「今日節目」已經換成這一份。' . ($warnings ? '下面有幾個地方請看一下。' : '');
        }
    } elseif ($action === 'import') {
        try {
            $r = nr_schedule_import();
            $weekday = $r['weekday']; $sunday = $r['sunday'];
            $msg = '已從官方節目表頁面載入 ' . count($weekday) . ' 個平日時段、' . count($sunday) . ' 個週日時段。檢查沒問題後，按最下面的「儲存節目表」才會生效。';
        } catch (Throwable $e) { $err = $e->getMessage(); }
    } elseif ($action === 'reset') {
        if (is_file(nr_schedule_admin_path())) @unlink(nr_schedule_admin_path());
        $sched = nr_schedule(); $weekday = $sched['weekday'] ?? []; $sunday = $sched['sunday'] ?? [];
        $usingAdmin = false;
        $msg = '已恢復成自動抓的版本，後台改過的內容已清掉。';
    }
}

function nr_slot_rows(string $day, array $slots): void {
    if (!$slots) $slots = [['start' => '', 'end' => '', 'title' => '', 'hosts' => [], 'summary' => '', 'rerun' => false]];
    foreach ($slots as $i => $s) {
        $hosts = is_array($s['hosts'] ?? null) ? implode('、', $s['hosts']) : (string) ($s['hosts'] ?? '');
        echo '<li class="nr-slot">
      <div class="nr-slot-time">
        <label>開始<input type="text" name="' . $day . '[' . $i . '][start]" value="' . h($s['start'] ?? '') . '" inputmode="numeric" placeholder="例 10:00" pattern="[0-9]{1,2}:[0-9]{2}" title="請用 小時:分鐘，例如 10:00"></label>
        <label>結束<input type="text" name="' . $day . '[' . $i . '][end]" value="' . h($s['end'] ?? '') . '" inputmode="numeric" placeholder="例 12:00" pattern="[0-9]{1,2}:[0-9]{2}" title="請用 小時:分鐘，最後一檔可以寫 24:00"></label>
      </div>
      <label class="nr-slot-title">節目名稱<input type="text" name="' . $day . '[' . $i . '][title]" value="' . h($s['title'] ?? '') . '" placeholder="例 歡喜來相逢"></label>
      <label class="nr-slot-hosts">主持人（多位用「、」隔開）<input type="text" name="' . $day . '[' . $i . '][hosts]" value="' . h($hosts) . '" placeholder="例 天鳳"></label>
      <label class="nr-slot-summary">一句話介紹（可空白）<input type="text" name="' . $day . '[' . $i . '][summary]" value="' . h($s['summary'] ?? '') . '"></label>
      <div class="nr-slot-foot">
        <label class="nr-check"><input type="checkbox" name="' . $day . '[' . $i . '][rerun]" value="1" ' . (!empty($s['rerun']) ? 'checked' : '') . '> 這是重播</label>
        <button type="button" class="nr-btn nr-danger" data-remove>刪除這個時段</button>
      </div>
    </li>';
    }
}
?>
<!doctype html><html lang="zh-Hant-TW"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex">
<title>節目表｜電台消息報恁知 後台</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700;800&display=swap"><link rel="stylesheet" href="../news.css"></head>
<body class="nr-admin">
<main class="nr-wrap">
  <header class="nr-top">
    <div><h1>節目表</h1><p class="nr-help">官網首頁的「現在播出」「今日節目」「主持人」都看這一份。改完按最下面的「儲存節目表」。</p></div>
    <div class="nr-actions"><a class="nr-btn" href="index.php">← 回消息列表</a> <a class="nr-btn" href="../../index.html#schedule" target="_blank">看官網</a></div>
  </header>
  <?php if ($msg): ?><p class="nr-ok"><?= h($msg) ?></p><?php endif; ?>
  <?php if ($err): ?><p class="nr-err"><?= h($err) ?></p><?php endif; ?>
  <?php if ($warnings): ?><div class="nr-warn"><strong>請看一下：</strong><ul><?php foreach ($warnings as $w): ?><li><?= h($w) ?></li><?php endforeach; ?></ul></div><?php endif; ?>

  <section class="nr-card nr-schedule-tools">
    <p class="nr-help">目前官網用的是：<strong><?= $usingAdmin ? '後台存的這一份' : '自動從官方節目表頁抓的版本' ?></strong><?= !empty($sched['generatedAt']) ? '（' . h(str_replace('T', ' ', substr((string) $sched['generatedAt'], 0, 16))) . ' 更新）' : '' ?></p>
    <div class="nr-actions">
      <form method="post"><input type="hidden" name="csrf" value="<?= h($csrf) ?>"><input type="hidden" name="action" value="import"><button class="nr-btn" type="submit">從官方節目表頁面匯入</button></form>
      <?php if ($usingAdmin): ?><form method="post" onsubmit="return confirm('確定要清掉後台改過的節目表，恢復成自動抓的版本嗎？')"><input type="hidden" name="csrf" value="<?= h($csrf) ?>"><input type="hidden" name="action" value="reset"><button class="nr-btn nr-quiet" type="submit">恢復成自動抓的版本</button></form><?php endif; ?>
    </div>
  </section>

  <form method="post" id="nr-schedule-form">
    <input type="hidden" name="csrf" value="<?= h($csrf) ?>"><input type="hidden" name="action" value="save">
    <section class="nr-card">
      <h2>週一至週六</h2>
      <ul class="nr-slots" data-day="weekday"><?php nr_slot_rows('weekday', $weekday); ?></ul>
      <button type="button" class="nr-btn" data-add="weekday">＋ 加一個時段</button>
    </section>
    <section class="nr-card">
      <h2>週日</h2>
      <ul class="nr-slots" data-day="sunday"><?php nr_slot_rows('sunday', $sunday); ?></ul>
      <button type="button" class="nr-btn" data-add="sunday">＋ 加一個時段</button>
    </section>
    <div class="nr-actions nr-sticky"><button class="nr-btn nr-primary nr-big" type="submit">儲存節目表</button> <a class="nr-btn" href="index.php">取消</a></div>
  </form>
</main>
<script>
(function () {
  // 加時段：複製該天最後一列、清空內容；刪時段：至少留一列。存檔時後端會依開始時間重新排序，所以順序不用手動調。
  document.querySelectorAll('[data-add]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var list = document.querySelector('.nr-slots[data-day="' + btn.dataset.add + '"]');
      var rows = list.querySelectorAll('.nr-slot');
      var clone = rows[rows.length - 1].cloneNode(true);
      var n = rows.length;
      clone.querySelectorAll('input').forEach(function (inp) {
        inp.name = inp.name.replace(/\[\d+\]/, '[' + n + ']');
        if (inp.type === 'checkbox') inp.checked = false; else inp.value = '';
      });
      // 新時段的開始時間預設接在上一檔結束之後
      var prevEnd = rows[rows.length - 1].querySelector('input[name$="[end]"]').value;
      if (prevEnd) clone.querySelector('input[name$="[start]"]').value = prevEnd;
      list.appendChild(clone);
      clone.querySelector('input[name$="[title]"]').focus();
    });
  });
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-remove]'); if (!btn) return;
    var row = btn.closest('.nr-slot'), list = row.parentNode;
    if (list.querySelectorAll('.nr-slot').length <= 1) { row.querySelectorAll('input').forEach(function (i) { if (i.type === 'checkbox') i.checked = false; else i.value = ''; }); return; }
    var title = row.querySelector('input[name$="[title]"]').value;
    if (title && !confirm('確定刪除「' + title + '」這個時段？')) return;
    row.remove();
  });
  // 輸入 1000 或 10.00 這類寫法，離開欄位時自動變成 10:00
  document.addEventListener('blur', function (e) {
    var inp = e.target; if (!(inp instanceof HTMLInputElement) || !/\[(start|end)\]$/.test(inp.name)) return;
    var v = inp.value.replace(/[．。.：]/g, ':').replace(/\s/g, '');
    var m = v.match(/^(\d{1,2}):?(\d{2})$/); if (m) inp.value = m[1].padStart(2, '0') + ':' + m[2];
  }, true);
})();
</script>
</body></html>
