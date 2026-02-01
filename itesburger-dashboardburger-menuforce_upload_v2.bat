[33mcommit 08391e2c38570e266388e72386969889f91544c2[m[33m ([m[1;36mHEAD[m[33m -> [m[1;32mmain[m[33m, [m[1;31morigin/main[m[33m)[m
Author: Burger Lab Admin <admin@burgerlab.com>
Date:   Sun Feb 1 03:09:37 2026 +0300

    Add newly generated burger menu images

 burger-menu/images/butter_chicken.png   | Bin [31m0[m -> [32m567667[m bytes
 burger-menu/images/flaky_chicken.png    | Bin [31m0[m -> [32m588539[m bytes
 burger-menu/images/gunners_chicken.png  | Bin [31m0[m -> [32m566624[m bytes
 burger-menu/images/jalapeno_chicken.png | Bin [31m0[m -> [32m558325[m bytes
 4 files changed, 0 insertions(+), 0 deletions(-)

[33mcommit 8e0ba5f8c5fa0c4e293dea8ded9ddf4d40657324[m
Author: Burger Lab Admin <admin@burgerlab.com>
Date:   Wed Jan 28 10:39:29 2026 +0300

    Fix: Smart menu label logic to ignore weak DB defaults

 burger-menu/js/main.js | 34 [32m+++++++++++++++++[m[31m-----------------[m
 1 file changed, 17 insertions(+), 17 deletions(-)

[33mcommit 55e85388f444ccbb7072402e500301f5b559a1d5[m
Author: Burger Lab Admin <admin@burgerlab.com>
Date:   Wed Jan 28 10:22:18 2026 +0300

    Fix: Synced latest UI translation changes (Single/Double labels)

 burger-menu/index.html |   2 [32m+[m[31m-[m
 burger-menu/js/main.js | 113 [32m++++++++++++++++++++++++++++++++++[m[31m---------------[m
 src/App.jsx            |   9 [32m+[m[31m---[m
 3 files changed, 82 insertions(+), 42 deletions(-)

[33mcommit 11754f5d69dcbb1d2dd9808136011c96583da88c[m
Author: Burger Lab Admin <admin@burgerlab.com>
Date:   Wed Jan 28 10:08:53 2026 +0300

    Fix: Dashboard default titles and Banner consistency

 src/App.jsx | 9 [32m++++++++[m[31m-[m
 1 file changed, 8 insertions(+), 1 deletion(-)

[33mcommit 4702ce77ccfffbec09af9399221868221452eb98[m
Author: Burger Lab Admin <admin@burgerlab.com>
Date:   Wed Jan 28 10:06:16 2026 +0300

    Fix: Ensure consistent plural Category Titles and immediate UI sync

 burger-menu/index.html | 2 [32m+[m[31m-[m
 burger-menu/js/main.js | 3 [32m+++[m
 2 files changed, 4 insertions(+), 1 deletion(-)
