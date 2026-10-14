Picvium.Gpr.exe: GoPro GPR (VC-5 DNG) to uncompressed DNG conversion worker.
It runs as a separate, memory-limited process; Picvium develops the converted DNG with lib/Picvium.Raw.dll.

Components linked into Picvium.Gpr.exe:
- GoPro GPR SDK (gpr_sdk, vc5_common, vc5_decoder, common), Copyright 2018 GoPro, Inc.
  Dual-licensed Apache-2.0 or MIT; Picvium uses it under the MIT license (GoPro-LICENSE-MIT.txt).
  The Apache-2.0 text is included for reference (GoPro-LICENSE-APACHE.txt).
- Adobe DNG SDK 1.4 sources as distributed and modified in the GoPro GPR SDK,
  Copyright Adobe Systems Incorporated (Adobe-DNG-SDK-BSD-License.txt).
- Adobe XMP Toolkit core sources as distributed in the GoPro GPR SDK,
  Copyright Adobe Systems Incorporated (Adobe-XMP-BSD-License.txt).
- MD5 implementation by Colin Plumb (public domain, md5_lib).
- Runtime libraries linked by the Zig 0.15.2 toolchain (LLVM libc++, libc++abi, libunwind and
  MinGW-w64 runtime files): see licenses/zig-runtime/. The compiler itself is not included.

Expat is not linked. The GPR SDK bundles Expat 2.1.0 for XMP parsing; Picvium replaces its
entry points with stubs that always report invalid XML, so embedded XMP is ignored.

Source: https://github.com/gopro/gpr, commit 446c736a38fb14f51343605c0780d347dc602f89
Source archive SHA256: 61ed13ab955c37cad0afd9b218281b241b00c541a945722f2e6979bded905658
The upstream sources are compiled unchanged. Only the reading path is built:
GPR_READING=1, GPR_WRITING=0, GPR_JPEG_AVAILABLE=0, GPR_TIMING=0, XML_STATIC=1, NDEBUG.
