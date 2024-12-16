# orchard website

Roughly, to make a new page, just do an html file and go:

```html
<!DOCTYPE html>
<html>

<head>
  <title>[orchard]</title>
  <link rel="icon" type="image/png" href="./static/icon.avif">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Agu+Display&family=Dokdo&family=Rubik:ital,wght@0,300..900;1,300..900&display=swap" rel="stylesheet">

<link href='https://fonts.googleapis.com/css?family=Cormorant Garamond' rel='stylesheet'>

  <link rel="stylesheet" href="./styles.css">
</head>

<body>
  <header>
    <img src="./static/banner_no_bg.png" id="banner" style="margin-bottom: 20px;" />
    <nav>
      (<a href="https://orchard.day">home</a>)
      &nbsp;&nbsp;
      (<a href="./about.html">about</a>)
      &nbsp;&nbsp;
      (<a href="./photos.html">photos</a>)
      &nbsp;&nbsp;
      (<a href="./logs.html">logs</a>)
    </nav>
  </header>

  <article>
  </article>

</body>
</html>
```

Just make sure to change the title, and the rest is normal html stuff. Just look at other images/things to learn how to use HTML/CSS styling. 

There's a ton of free markdown to html converters (you can code one yourself in a hot second), so not really fussed about that right now. 

## TODOS

Need to make a logs folder, and then just link them in `logs.html`

Need to figure out why the photos don't immediately load 

Need to figure out why when background color changes theres a black footer

Ask someone more experienced with this to help.

Need to add proper doodles (utilize the figma)