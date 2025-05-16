import { z } from "zod";

import { SITE_URL } from "@src/constants/constants";
import { MetadataAttribute } from "@lens-protocol/metadata";

export const roundedToFixed = (input: number, digits = 4): string => {
  const rounder = Math.pow(10, digits);
  const value = Math.round(input * rounder) / rounder;
  return value.toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
};

export function shortAddress(address: string, num = 5) {
  return address.slice(0, num) + " ... " + address.slice(address.length - (num - 1));
}

export const kFormatter = (num, asInteger = false) => {
  if (typeof num === "string") return num;

  if (Math.abs(num) > 999_999) {
    return Math.sign(num) * (Math.abs(num) / 1_000_000).toFixed(1) + "m";
  } else if (Math.abs(num) > 999) {
    return Math.sign(num) * (Math.abs(num) / 1000).toFixed(1) + "k";
  }

  return !asInteger
    ? Number((Math.sign(num) * Math.abs(num)).toFixed(2)).toFixed(2)
    : Number(Math.sign(num) * Math.abs(num));
};

interface IntentUrlProps {
  text: string;
  referralAddress: string;
  chain: string;
  tokenAddress: string;
}

export function tweetIntentTokenReferral({ text, chain, tokenAddress, referralAddress }: IntentUrlProps) {
  const url = `${SITE_URL}/token/${chain}/${tokenAddress}?ref=${referralAddress}`;
  return `https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURI(`${url}`)}`;
}

export function castIntentTokenReferral({ text, chain, tokenAddress, referralAddress }: IntentUrlProps) {
  const url = `${SITE_URL}/token/${chain}/${tokenAddress}?ref=${referralAddress}`;
  return `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}&embeds[]=${encodeURI(`${url}`)}`;
}

export const parseBase64Image = (imageBase64: string): File | undefined => {
  try {
    // Extract image type from base64 string
    const matches = imageBase64.match(/^data:image\/(\w+);base64,/);
    if (!matches) {
      throw new Error("parseBase64Image:: failed to infer image type");
    }

    const imageType = matches[1];
    const mimeType = `image/${imageType}`;

    // Convert base64 to buffer
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const imageBuffer = Buffer.from(base64Data, "base64");

    // Create a file object that can be used with FormData
    const blob = new File([imageBuffer], `bonsai_generated_${Date.now()}.${imageType}`, {
      type: mimeType,
    });

    return Object.assign(blob, {
      preview: URL.createObjectURL(blob),
    });
  } catch (error) {
    console.log(error);
  }
};

export const reconstructZodSchema = (shape: any) => {
  return z.object(
    Object.entries(shape).reduce((acc, [key, field]) => {
      let fieldSchema;
      const originalField = field;
      field = field._def;

      const description = field.description;
      let type = field.typeName;
      let nullish = false;

      // Recursively unwrap ZodNullable and ZodOptional types
      while (field.innerType && (field.typeName === "ZodNullable" || field.typeName === "ZodOptional")) {
        nullish = true;
        type = field.innerType._def.typeName;
        field = field.innerType._def;
      }

      switch (type) {
        case "ZodString":
          fieldSchema = z.string();
          // Apply string validations if they exist
          if (field.checks) {
            field.checks.forEach((check: any) => {
              switch (check.kind) {
                case "max":
                  fieldSchema = fieldSchema.max(check.value);
                  break;
                case "min":
                  fieldSchema = fieldSchema.min(check.value);
                  break;
                case "email":
                  fieldSchema = fieldSchema.email();
                  break;
                case "url":
                  fieldSchema = fieldSchema.url();
                  break;
              }
            });
          }
          break;
        case "ZodNumber":
          fieldSchema = z.number();
          break;
        case "ZodBoolean":
          fieldSchema = z.boolean();
          break;
        case "ZodArray":
          fieldSchema = z.array(z.any()); // or recursive if needed
          break;
        case "ZodObject":
          fieldSchema = reconstructZodSchema(field.shape);
          break;
        default:
          fieldSchema = z.any();
      }

      // Add description if present
      if (description) {
        fieldSchema = fieldSchema.describe(description);
      }

      // Make nullish if the original was nullish
      if (nullish) {
        fieldSchema = fieldSchema.nullish();
      }

      return {
        ...acc,
        [key]: fieldSchema,
      };
    }, {}),
  );
};

export const getSmartMediaUrl = (attributes: MetadataAttribute[]): string | undefined => {
  const isBonsaiPlugin = attributes.some((attr) => attr.key === "template");

  if (!isBonsaiPlugin) return;

  return attributes.find((attr) => attr.key === "apiUrl")?.value;
};

// distance in the future
export const formatNextUpdate = (timestamp: number): string => {
  const now = new Date();
  const lastUpdateTime = new Date(timestamp * 1000);
  const timeSinceUpdate = Math.floor((now.getTime() - lastUpdateTime.getTime()) / 60000); // in minutes

  // Base minutes until next hour
  const minutesLeft = 60 - now.getMinutes();

  // If update was less than an hour ago, add 60 minutes
  if (timeSinceUpdate < 60) {
    return `${minutesLeft + 60}m`;
  }

  return `${minutesLeft}m`;
}

export const trimText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
};
