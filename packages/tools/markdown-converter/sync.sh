#/bin/sh

HAIKU_REPO_PATH=~/.osmosnote/repo
MD_REPO_NOTES_PATH=~/repos/s2-notes-md/data/notes

rm -rf ./input
mkdir ./input
rm -rf ./output
mkdir ./output

# load inputs
git -C $HAIKU_REPO_PATH pull
cp $HAIKU_REPO_PATH/* ./input

# convert
node ./haiku-to-md.js

# update target
git -C $MD_REPO_NOTES_PATH fetch
git -C $MD_REPO_NOTES_PATH reset --hard origin/master
rm -rf $MD_REPO_NOTES_PATH/*
cp ./output/* $MD_REPO_NOTES_PATH/

# let user finish git push
git -C $MD_REPO_NOTES_PATH add -A
git -C $MD_REPO_NOTES_PATH status
git -C $MD_REPO_NOTES_PATH commit -m "sync"
git -C $MD_REPO_NOTES_PATH push

