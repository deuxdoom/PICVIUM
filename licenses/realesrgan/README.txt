lib/realesrgan: the AI upscale engine (Windows x64). Picvium starts realesrgan-ncnn-vulkan.exe as a
separate, memory-limited process for each 4x inference and only exchanges PNG files with it.

realesrgan-ncnn-vulkan.exe
- Real-ESRGAN ncnn Vulkan v0.2.0, official Windows release, unmodified.
  Copyright (c) 2021 Xintao Wang; based on realsr-ncnn-vulkan, Copyright (c) 2019 nihui.
  MIT License (Real-ESRGAN-ncnn-vulkan-LICENSE.txt).
  Source: https://github.com/xinntao/Real-ESRGAN-ncnn-vulkan/tree/v0.2.0
  Release: https://github.com/xinntao/Real-ESRGAN-ncnn-vulkan/releases/download/v0.2.0/realesrgan-ncnn-vulkan-v0.2.0-windows.zip
  Archive SHA256:    1bbbdb12d470af80b035c773682e144c6c2f6ece9210832a289af0a48ce3fa9a
  Executable SHA256: 07e49f7cbb4ede01ae4dd4c399d3a7e5846e3d2085c3128eff881e55cb7b1a0c
- Components built into the executable (submodules of v0.2.0):
  - ncnn, Copyright (C) 2017 THL A29 Limited, a Tencent company, BSD 3-Clause with the notices of its own dependencies
    (ncnn-LICENSE.txt), commit 6125c9f47cd14b589de0521350668cf9d3d37e3c.
  - glslang, Khronos Group, used by ncnn to compile its Vulkan shaders (glslang-LICENSE.txt),
    commit 4afd69177258d0636f78d2c4efb823ab6382a187.
  - libwebp, Copyright (c) 2010 Google Inc., BSD 3-Clause with an additional patent grant
    (libwebp-COPYING.txt, libwebp-PATENTS.txt), commit 8ea81561d2fdd382da60f57958741a7c23a18eb6.
  - dirent for Windows, Copyright (C) 1998-2019 Toni Ronkko, MIT License (dirent-LICENSE.txt).
  The Windows build reads and writes images with the Windows Imaging Component; stb, which the
  engine uses on Linux and macOS, is not part of it.

models/realesrgan-x4plus.param, .bin and models/realesrgan-x4plus-anime.param, .bin
- Real-ESRGAN NCNN models, Copyright (c) 2021 Xintao Wang, BSD 3-Clause (Real-ESRGAN-LICENSE.txt).
  Source: https://github.com/xinntao/Real-ESRGAN, release v0.2.5.0
  Release: https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.5.0/realesrgan-ncnn-vulkan-20220424-windows.zip
  Archive SHA256: abc02804e17982a3be33675e4d471e91ea374e65b70167abc09e31acb412802d
  realesrgan-x4plus.param        35330ececcea33b6c397a72548e788d5d53becee4734c50b7fada36e89f10a86
  realesrgan-x4plus.bin          713ee713b0353afaa27976f0563a64a5043bd70b9bd8936c2e26e25ebcdbcddf
  realesrgan-x4plus-anime.param  2b8fb6e0ae4d2d85704ca08c119a2f5ea40add4f2ecd512eb7f4cd44b6127ed4
  realesrgan-x4plus-anime.bin    fe01c269cfd10cdef8e018ab66ebe750cf79c7af4d1f9c16c737e1295229bacc

vcomp140.dll
- Microsoft Visual C++ OpenMP runtime 14.51.36247.0 (x64), Copyright (c) Microsoft Corporation.
  Taken unmodified from the official Microsoft Visual C++ Redistributable (x64) 14.51.36247.0
  (vc_redist.x64.exe, SHA256 843068991daaa1f73ad9f6239bce4d0f6a07a51f18c37ea2a867e9beca71295c) and
  redistributed as Distributable Code under the Microsoft Visual Studio license terms.
  It remains subject to Microsoft's terms and may not be modified.
  SHA256: 95d4ce4a6802d1e18b5e0e1722cc30ea72ca7e033f83828f05c0b7b993fe7cbf
  The engine release archive also contains vcomp140.dll and a debug build (vcomp140d.dll); neither is used.
