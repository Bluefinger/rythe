#!/bin/bash

coverageCmd() {
  curl -s https://codecov.io/bash -o ./codecov.sh
}

if [ "$COVERAGE" = true ] ; then
  echo "Preparing coverage upload script..."
  coverageCmd
  /bin/bash ./codecov.sh
else
  echo "Skipping coverage upload!";
fi
