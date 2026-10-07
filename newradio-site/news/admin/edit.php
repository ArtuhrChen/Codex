<?php
/** 寫 / 編輯一則消息：標題、日期、內文（所見即所得）、圖片、表情符號、發布 */
declare(strict_types=1);
require __DIR__ . '/../lib.php';
nr_require_login();
$items = nr_items(); $csrf = nr_csrf();
$id = (string) ($_GET['id'] ?? $_POST['id'] ?? '');
$item = null;
foreach ($items as $it) if ($it['id'] === $id) { $item = $it; break; }
$err = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    nr_check_csrf();
    $title = trim((string) ($_POST['title'] ?? ''));
    $date = (string) ($_POST['date'] ?? date('Y-m-d'));
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) $date = date('Y-m-d');
    $html = nr_sanitize((string) ($_POST['html'] ?? ''));
    $published = !empty($_POST['published']); $pinned = !empty($_POST['pinned']);
    if ($title === '') $err = '請先寫一個標題。';
    elseif (nr_excerpt($html, 1) === '' && nr_first_image($html) === '') $err = '內文是空的，寫一點內容或放一張圖。';
    else {
        if ($item) {
            foreach ($items as $k => $it) if ($it['id'] === $id) $items[$k] = array_merge($it, ['title' => $title, 'date' => $date, 'html' => $html, 'published' => $published, 'pinned' => $pinned, 'updated' => date('c')]);
        } else {
            $items[] = ['id' => nr_id(), 'title' => $title, 'date' => $date, 'html' => $html, 'published' => $published, 'pinned' => $pinned, 'created' => date('c'), 'updated' => date('c')];
        }
        nr_save_items($items);
        header('Location: index.php?saved=1'); exit;
    }
    $item = ['id' => $id, 'title' => $title, 'date' => $date, 'html' => $html, 'published' => $published, 'pinned' => $pinned];
}
$emoji = nr_read_json(NR_EMOJI . '/emoji.json', ['emoji' => []])['emoji'];
?>
<!doctype html><html lang="zh-Hant-TW"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex">
<title><?= $item ? '編輯消息' : '寫一則新消息' ?>｜電台消息報恁知 後台</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700;800&display=swap"><link rel="stylesheet" href="../news.css"></head>
<body class="nr-admin">
<main class="nr-wrap">
  <header class="nr-top"><div><h1><?= $item && $id ? '編輯消息' : '寫一則新消息' ?></h1><p class="nr-help">寫完按最下面的「儲存」。勾選「發布到官網」才會出現在首頁。</p></div><div class="nr-actions"><a class="nr-btn" href="index.php">← 回列表</a></div></header>
  <?php if ($err): ?><p class="nr-err"><?= h($err) ?></p><?php endif; ?>
  <form method="post" class="nr-card nr-editor-form" id="nr-form">
    <input type="hidden" name="csrf" value="<?= h($csrf) ?>"><input type="hidden" name="id" value="<?= h($id) ?>"><input type="hidden" name="html" id="nr-html">
    <div class="nr-two">
      <label>標題<input type="text" name="title" required maxlength="80" value="<?= h($item['title'] ?? '') ?>" placeholder="例：中秋連假節目調整"></label>
      <label>日期<input type="date" name="date" value="<?= h($item['date'] ?? date('Y-m-d')) ?>"></label>
    </div>
    <div class="nr-toolbar" role="toolbar" aria-label="編輯工具">
      <button type="button" data-cmd="bold" title="粗體"><b>B</b></button>
      <button type="button" data-cmd="italic" title="斜體"><i>I</i></button>
      <button type="button" data-cmd="underline" title="底線"><u>U</u></button>
      <span class="nr-sep"></span>
      <button type="button" data-block="h3" title="小標題">標題</button>
      <button type="button" data-block="p" title="一般文字">內文</button>
      <button type="button" data-cmd="insertUnorderedList" title="項目清單">• 清單</button>
      <button type="button" data-cmd="insertOrderedList" title="編號清單">1. 清單</button>
      <span class="nr-sep"></span>
      <button type="button" data-link title="加連結">🔗 連結</button>
      <button type="button" data-image title="放一張圖片">🖼 圖片</button>
      <button type="button" data-emoji-toggle title="表情符號" aria-expanded="false">😊 表情</button>
      <span class="nr-sep"></span>
      <button type="button" data-cmd="undo" title="復原">↶</button>
      <button type="button" data-cmd="redo" title="重做">↷</button>
      <input type="file" id="nr-file" accept="image/png,image/jpeg,image/webp,image/gif" hidden>
    </div>
    <div class="nr-emoji-panel" id="nr-emoji" hidden>
      <div class="nr-emoji-head"><strong>雲端新廣播專屬表情</strong><span>點一下就放進文章</span></div>
      <div class="nr-emoji-grid">
        <?php foreach ($emoji as $e): ?><button type="button" data-emoji="<?= h($e['code']) ?>" title="<?= h($e['label']) ?>"><img src="../emoji/<?= h($e['file']) ?>" alt="<?= h($e['label']) ?>" width="40" height="40"><span><?= h($e['label']) ?></span></button><?php endforeach; ?>
      </div>
      <div class="nr-emoji-head"><strong>一般表情</strong></div>
      <div class="nr-emoji-grid nr-emoji-unicode">
        <?php foreach (['😊','😄','🥰','👍','🎉','🎵','🎶','📻','🎙️','☁️','🌤️','🌧️','🙏','❤️','✨','📢','🗓️','⏰','🎁','🍀'] as $u): ?><button type="button" data-unicode="<?= $u ?>"><?= $u ?></button><?php endforeach; ?>
      </div>
    </div>
    <div class="nr-editor" id="nr-editor" contenteditable="true" aria-label="內文" data-placeholder="在這裡寫內文。可以貼圖片、加表情符號。"><?= $item['html'] ?? '' ?></div>
    <p class="nr-help nr-upload-status" id="nr-upload-status"></p>
    <div class="nr-publish">
      <label class="nr-check"><input type="checkbox" name="published" value="1" <?= !empty($item['published']) ? 'checked' : '' ?>> 發布到官網（沒勾就是草稿）</label>
      <label class="nr-check"><input type="checkbox" name="pinned" value="1" <?= !empty($item['pinned']) ? 'checked' : '' ?>> 置頂（永遠排第一）</label>
    </div>
    <div class="nr-actions nr-sticky"><button class="nr-btn nr-primary nr-big" type="submit">儲存</button> <a class="nr-btn" href="index.php">取消</a></div>
  </form>
  <section class="nr-card">
    <h2>官網上會長這樣</h2>
    <article class="news-card nr-preview" id="nr-preview"><div class="news-body"></div></article>
  </section>
</main>
<script src="editor.js"></script>
</body></html>
