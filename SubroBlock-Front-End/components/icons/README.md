THIS FOLDER IS GIT IGNORED!!!

USE next/image instead this folder. NOTHING SHOULD BE PUT HERE, DELETE IT

next/image will handle static image preload and images are simpler to import directly

```
import Image from "next/image";
import File from "@/public/file.svg";

<Image src={File} alt="icon" width={50} height={50} />
```
