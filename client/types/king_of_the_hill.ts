/**
 * Program IDL in camelCase format to be used in the Next.js client.
 *
 * This mirrors the Anchor-generated type found in the server workspace
 * at `target/types/king_of_the_hill.ts`.
 */
export type KingOfTheHill = {
  address: "5DJA7UW4Xdw8WcQFa937JxZXPbCqP36U5Lr751PQUfAg";
  metadata: {
    name: "kingOfTheHill";
    version: "0.1.0";
    spec: "0.1.0";
    description: "Created with Anchor";
  };
  instructions: [
    {
      name: "claimJackpot";
      discriminator: [number, number, number, number, number, number, number, number];
      accounts: [
        {
          name: "game";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [103, 97, 109, 101, 95, 118, 49];
              }
            ];
          };
        },
        { name: "king"; writable: true; signer: true },
        { name: "systemProgram"; address: "11111111111111111111111111111111" }
      ];
      args: [];
    },
    {
      name: "initialize";
      discriminator: [number, number, number, number, number, number, number, number];
      accounts: [
        {
          name: "game";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [103, 97, 109, 101, 95, 118, 49];
              }
            ];
          };
        },
        { name: "creator"; writable: true; signer: true },
        { name: "systemProgram"; address: "11111111111111111111111111111111" }
      ];
      args: [
        {
          name: "startPrice";
          type: "u64";
        }
      ];
    },
    {
      name: "usurpThrone";
      discriminator: [number, number, number, number, number, number, number, number];
      accounts: [
        {
          name: "game";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [103, 97, 109, 101, 95, 118, 49];
              }
            ];
          };
        },
        { name: "newKing"; writable: true; signer: true },
        { name: "previousKing"; writable: true },
        { name: "creator"; writable: true },
        { name: "systemProgram"; address: "11111111111111111111111111111111" }
      ];
      args: [];
    }
  ];
  accounts: [
    {
      name: "gameState";
      discriminator: [number, number, number, number, number, number, number, number];
    }
  ];
  errors: [
    { code: 6000; name: "gameEnded"; msg: "The game has ended!" },
    { code: 6001; name: "gameNotOver"; msg: "The game is not over yet!" },
    { code: 6002; name: "notTheKing"; msg: "You are not the King!" },
    {
      code: 6003;
      name: "wrongFeeOwner";
      msg: "Security Alert: Someone tried to redirect fees to the wrong wallet!";
    }
  ];
  types: [
    {
      name: "gameState";
      type: {
        kind: "struct";
        fields: [
          { name: "king"; type: "pubkey" },
          { name: "price"; type: "u64" },
          { name: "endTimestamp"; type: "i64" },
          { name: "jackpot"; type: "u64" },
          { name: "feeOwner"; type: "pubkey" }
        ];
      };
    }
  ];
};
