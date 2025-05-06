import axios from "axios";
import FormData from "form-data";

import { _hash } from "./pinata";

const STORJ_API_URL = "https://www.storj-ipfs.com";

export const pinFile = async (file: any) => {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await axios.post("/api/storj/add-file", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  });

  return data.Hash;
};

export const storjGatewayURL = (uriOrHash: string, useDefault = false) =>
  `${useDefault ? "https://ipfs.io" : STORJ_API_URL}/ipfs/${_hash(uriOrHash)}`;
