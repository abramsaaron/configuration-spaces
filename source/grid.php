<!DOCTYPE html>
<html lang="en">

<head>
  <title>Configuration Spaces</title>
  <meta name="author" content="Roger Antonsen and Aaron Abrams" />
  <meta charset="utf-8" />
  <link rel="stylesheet" type="text/css" href="styles.css" />
</head>

<?php
$items = [];
$handle = opendir("gallery/");
while (false !== ($filename = readdir($handle))) {
  $parts = explode(".", $filename);
  $name = $parts[0];
  $extension = $parts[1];
  if ($extension == 'png') {
    $item['image'] = 'gallery/' . $filename;
    $item['url'] = 'http://localhost:3000/?file=gallery/' . $name . '.txt';
    $item['name'] = explode("_", $name)[0];
    $item['content'] = file_get_contents('gallery/' . $name . '.txt');
    $items[] = $item;
  }
  uasort($items, function ($a, $b) {
    if ($a['name'] == $b['name']) return 0;
    return ($a['name'] < $b['name']) ? -1 : 1;
  });
};

?>

<body>
  <div class="mx-auto">
    <div class="flex flex-row flex-wrap items-center justify-start">
      <?php foreach ($items as $item) : ?>
        <div class="border border-black m-8 rounded-2xl">
          <a href="<?= $item['url']; ?>" target="_blank">
            <span class=" font-bold text-blue-600 p-4 text-4xl"><?= $item['name'] ?></span>
            <img class="w-32 md:w-96" src="<?= $item['image']; ?>" alt="">
          </a>
        </div>
      <?php endforeach ?>
    </div>

  </div>
</body>

</html>