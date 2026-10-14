Runtime libraries linked into Picvium's own native files (lib/Picvium.Raw.dll, lib/Picvium.Gpr.exe),
which are built with the Zig 0.15.2 toolchain (https://ziglang.org/download/). The compiler itself is not included.

- LLVM libc++, libc++abi, libunwind: Apache-2.0 WITH LLVM-exception
  (libcxx-LICENSE.txt, libcxxabi-LICENSE.txt, libunwind-LICENSE.txt)
- MinGW-w64 runtime: ZPL-2.1, with individually marked public-domain/BSD/LGPL portions
  (MinGW-w64-COPYING.txt, MinGW-w64-AUTHORS.txt)
- Zig: MIT (Zig-LICENSE.txt)
