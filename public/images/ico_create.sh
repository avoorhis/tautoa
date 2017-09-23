#!/bin/bash

# from
# http://bergamini.org/computers/creating-favicon.ico-icon-files-with-imagemagick-convert.html

# ENTER png image on command-line
convert $1 -resize 256x256 -transparent white $1-256.png
convert $1-256.png -resize 16x16 $1-16.png
convert $1-256.png -resize 32x32 $1-32.png
convert $1-256.png -resize 64x64 $1-64.png
convert $1-256.png -resize 128x128 $1-128.png
convert $1-16.png $1-32.png $1-64.png $1-128.png $1-256.png -colors 256 $1.ico

