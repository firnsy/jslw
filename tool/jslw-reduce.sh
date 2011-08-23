#!/bin/bash

urlencode()
{
  local arg
  arg=”$1″
  while [[ "$arg" =~ ^([0-9a-zA-Z/:_\.\-]*)([^0-9a-zA-Z/:_\.\-])(.*) ]]
  do
    echo -n “${BASH_REMATCH[1]}”
    printf “%%%X” “‘${BASH_REMATCH[2]}’”
    arg=”${BASH_REMATCH[3]}”
  done

  # the remaining part
  echo -n “$arg”
}

BASE_PATH=${0}

JSLW_COMPONENTS="js/core.js \
js/array.js \
js/button.js \
js/clock.js \
js/color.js \
js/font.js \
js/image-cache.js \
js/listbox.js \
js/rectangle.js \
js/slider.js \
js/tab-map.js \
js/text-edit.js \
js/vector.js \
js/widget.js"

JSLW_REDUCED="js/jslw.js"
JSLW_REDUCED_MIN="js/jslw.min.js"

# push working directory
#popd >/dev/null 2>&1



# clear the destination file
> ${JSLW_REDUCED}

# append all components
for F in ${JSLW_COMPONENTS}
do
  cat ${F} >> ${JSLW_REDUCED}
done




#cat "${JSLW_REDUCED}"
#URL_ENCODED=$(cat "${JSLW_REDUCED}" | urlencode )
#echo ${URL_ENCODED}

# minimise
echo "/*
 * This file is part of the JavaScript Lightweight Widget framework
 *
 * Copyright (C) 2010-2011, Ian Firns        <firnsy@securixlive.com>
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License Version 2 as
 * published by the Free Software Foundation.  You may not use, modify or
 * distribute this program under any other version of the GNU General
 * Public License.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA 02111-1307, USA.
*/
" > ${JSLW_REDUCED_MIN}


#curl -s \
#     -d compilation_level=SIMPLE_OPTIMIZATIONS \
#     -d output_format=text \
#     -d output_info=compiled_code \
#     --data-urlencode "js_code@${IN}" \
#     http://closure-compiler.appspot.com/compile
#     >> ${JSLW_REDUCED_MIN}

# obfuscate


# restore original directory
#popd >/dev/null 2>&1
