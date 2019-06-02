#!/bin/bash
coverageCmd() {
  curl -s https://codecov.io/bash -o ./codecov.sh
}
if $COVERAGE; then
  echo "Preparing coverage upload script...\n"
  coverageCmd
  /bin/bash ./codecov.sh
else
  echo "Skipping coverage upload!\n";
fi
