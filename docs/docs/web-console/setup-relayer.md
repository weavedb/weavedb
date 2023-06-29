---
sidebar_position: 8
---
# Set up Relayer

![](https://i.imgur.com/a9QtXYf.png)

- Set a distinct name in `Job Name` input field. This will be used as an ID for the relayer job. This is the only required parameter.

- Set an EVM or Arweave addresses allowed to relay the job in the `Relayers` input field. You can add multiple addresses by clicking `Add Relayer` button. If unassigned, anyone can relay the job.

- Choose a type of the relayer validation from the dropdown ( none | number | percent). Set the `Multisig` input field to `0` or leave it empty if `none` is chosen from the dropdown.

- When multisig relayer type is set to `number` or `percent`, set the addresses approved for multisig in the `Signers` input field.

- Set JSON schema for the additional data to be attached by the relayer. If none, set `{ }` inside thetext area.