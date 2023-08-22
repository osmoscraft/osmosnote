#/bin/sh

rm -rf ./input
mkdir ./input
rm -rf ./output
mkdir ./output

# load inputs
git -C ~/.osmosnote/repo pull
cp ~/.osmosnote/repo/* ~/repos/osmosnote/packages/tools/markdown-converter/input

# convert
node ./haiku-to-md.js

# update target
git -C ~/repos/s2-notes-md/data/notes fetch
git -C ~/repos/s2-notes-md/data/notes reset --hard origin/master
rm -rf ~/repos/s2-notes-md/data/notes/*
cp ~/repos/osmosnote/packages/tools/markdown-converter/output/* ~/repos/s2-notes-md/data/notes/

# let user finish git push
git -C ~/repos/s2-notes-md/data/notes add -A
git -C ~/repos/s2-notes-md/data/notes status
git -C ~/repos/s2-notes-md/data/notes commit -m "sync"
git -C ~/repos/s2-notes-md/data/notes push

