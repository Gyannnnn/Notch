import { useEffect, useMemo, useState } from "react";
import { Image } from "react-native";

/**
 * Width ÷ height, used for any photo whose real size isn't known yet. 4:5 is the
 * portrait crop a phone camera gives a mirror shot, so a frame that guesses
 * wrong is briefly a little too tall rather than a letterbox the photo rattles
 * around in.
 */
const FALLBACK_ASPECT = 4 / 5;

/**
 * Module-level rather than per-hook: the gallery, the pager and the comparison
 * screen all ask about the same photos, and an aspect ratio is a property of the
 * file, not of whoever is asking. Measuring it twice is a network round trip.
 */
const cache = new Map<string | number, number>();

/** Bundled assets are already on disk, so Metro knows their size with no I/O. */
function bundledAspect(uri: string | number): number | undefined {
  if (typeof uri !== "number") return undefined;
  const asset = Image.resolveAssetSource(uri);
  if (!asset?.width || !asset?.height) return undefined;
  return asset.width / asset.height;
}

/**
 * The true proportions of each photo, so a frame can be built around the picture
 * instead of the picture being cropped into a frame.
 *
 * `require()`d assets resolve during render, which matters: the pager sizes and
 * positions every page from these ratios, so a value that only arrived on the
 * second frame would lay the list out once and then shuffle it under the user.
 * A remote URL can only be measured by asking for it, so those start at
 * FALLBACK_ASPECT and settle when the answer lands.
 */
export function usePhotoAspects(uris: (string | number)[]): (uri: string | number) => number {
  // Seeding during render is safe here — writing a file's own dimensions is
  // idempotent, and the alternative is an effect that lands one frame too late.
  for (const uri of uris) {
    if (cache.has(uri)) continue;
    const bundled = bundledAspect(uri);
    if (bundled !== undefined) cache.set(uri, bundled);
  }

  const [settled, setSettled] = useState(0);
  const signature = JSON.stringify(uris.map(String));

  const pending = useMemo(
    () => uris.filter((uri): uri is string => typeof uri === "string" && !cache.has(uri)),
    // `signature` stands in for the array: a new array of the same URIs is the
    // same work, and depending on the array itself would restart it every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [signature],
  );

  useEffect(() => {
    if (pending.length === 0) return;
    let alive = true;
    let landed = 0;

    const settle = () => {
      landed += 1;
      // One re-render for the batch, not one per photo — each would relayout the
      // whole pager.
      if (alive && landed === pending.length) setSettled((count) => count + 1);
    };

    for (const uri of pending) {
      Image.getSize(
        uri,
        (width, height) => {
          if (width > 0 && height > 0) cache.set(uri, width / height);
          settle();
        },
        () => {
          // Cache the fallback too, so a photo that can't be measured isn't
          // re-requested on every scroll.
          cache.set(uri, FALLBACK_ASPECT);
          settle();
        },
      );
    }

    return () => {
      alive = false;
    };
  }, [pending]);

  return useMemo(
    () => (uri: string | number) => cache.get(uri) ?? FALLBACK_ASPECT,
    // A new identity on every settle is the point: it re-runs the layout memo
    // these measurements feed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [signature, settled],
  );
}
