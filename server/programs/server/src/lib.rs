use anchor_lang::prelude::*;
use anchor_lang::system_program;

declare_id!("4jZ5W4jnLTuycfTxREkNq4nQxQZfswHF2HEg4NNtGgDe");

#[program]
pub mod king_of_the_hill {
    use super::*;

    // 1. INITIALIZE GAME
    // Sets up the game state and saves YOU as the permanent Fee Owner
    pub fn initialize(ctx: Context<Initialize>, start_price: u64) -> Result<()> {
        let game = &mut ctx.accounts.game;
        game.king = ctx.accounts.creator.key();
        game.price = start_price;
        game.end_timestamp = Clock::get()?.unix_timestamp + 86400; // 24 Hours
        game.jackpot = 0;
        
        // SECURITY CRITICAL: Save your address here so no one can change it later
        game.fee_owner = ctx.accounts.creator.key(); 
        
        msg!("Game Initialized! Fee Owner set to: {}", game.fee_owner);
        Ok(())
    }

    // 2. USURP THRONE
    pub fn usurp_throne(ctx: Context<UsurpThrone>) -> Result<()> {
        let game = &mut ctx.accounts.game;
        let previous_king = &mut ctx.accounts.previous_king;
        let new_king = &ctx.accounts.new_king;
        let system_program = &ctx.accounts.system_program;

        // --- TIME CHECK ---
        let current_time = Clock::get()?.unix_timestamp;
        if current_time > game.end_timestamp {
             return err!(GameError::GameEnded);
        }

        // --- MATH (Safe Checked Math) ---
        // 1. Calculate New Price (Current + 30%)
        let raise_amount = game.price.checked_mul(30).unwrap().checked_div(100).unwrap();
        let incoming_bid = game.price.checked_add(raise_amount).unwrap();

        // 2. Calculate Splits
        let refund = game.price; 
        let profit = game.price.checked_mul(15).unwrap().checked_div(100).unwrap(); // 15%
        let creator_fee = game.price.checked_mul(5).unwrap().checked_div(100).unwrap(); // 5%
        
        // 3. Remainder -> Jackpot
        let total_payouts = refund.checked_add(profit).unwrap().checked_add(creator_fee).unwrap();
        let to_jackpot = incoming_bid.checked_sub(total_payouts).unwrap();

        // --- TRANSFERS ---
        
        // A. Pay Previous King
        let king_payout = refund.checked_add(profit).unwrap();
        system_program::transfer(
            CpiContext::new(
                system_program.to_account_info(),
                system_program::Transfer {
                    from: new_king.to_account_info(),
                    to: previous_king.to_account_info(),
                }
            ),
            king_payout,
        )?;

        // B. Pay YOU (The Creator)
        // This will FAIL if ctx.accounts.creator does not match game.fee_owner
        system_program::transfer(
            CpiContext::new(
                system_program.to_account_info(),
                system_program::Transfer {
                    from: new_king.to_account_info(),
                    to: ctx.accounts.creator.to_account_info(),
                }
            ),
            creator_fee,
        )?;

        // C. Fill Jackpot (Game PDA)
        system_program::transfer(
            CpiContext::new(
                system_program.to_account_info(),
                system_program::Transfer {
                    from: new_king.to_account_info(),
                    to: game.to_account_info(),
                }
            ),
            to_jackpot,
        )?;

        // --- STATE UPDATES ---
        let old_king_key = game.king;
        game.king = new_king.key();
        game.price = incoming_bid;
        game.jackpot = game.jackpot.checked_add(to_jackpot).unwrap();

        // Anti-Snipe: < 5 mins left? Reset to 5 mins.
        if game.end_timestamp - current_time < 300 {
            game.end_timestamp = current_time + 300;
            msg!("Anti-Snipe! Timer extended.");
        }

        emit!(NewKingEvent {
            new_king: new_king.key(),
            previous_king: old_king_key,
            price: incoming_bid,
            timestamp: current_time,
        });

        msg!("New King! Price: {} | Jackpot: {}", game.price, game.jackpot);
        Ok(())
    }

    // 3. CLAIM JACKPOT
    pub fn claim_jackpot(ctx: Context<ClaimJackpot>) -> Result<()> {
        let game = &mut ctx.accounts.game;
        let king = &mut ctx.accounts.king;

        let current_time = Clock::get()?.unix_timestamp;
        if current_time <= game.end_timestamp {
            return err!(GameError::GameNotOver);
        }

        require_keys_eq!(game.king, king.key(), GameError::NotTheKing);

        let jackpot_amount = game.jackpot;
        
        // Transfer from PDA to Winner
        **game.to_account_info().try_borrow_mut_lamports()? -= jackpot_amount;
        **king.to_account_info().try_borrow_mut_lamports()? += jackpot_amount;

        msg!("Jackpot Claimed: {}", jackpot_amount);

        // Reset Game
        game.price = 100_000_000; // Reset to 0.1 SOL
        game.jackpot = 0;
        game.end_timestamp = current_time + 86400; 
        game.king = game.fee_owner; // Return throne to creator until next usurper steps in

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init, 
        payer = creator, 
        space = 8 + 32 + 8 + 8 + 8 + 32,
        seeds = [b"game_v1"], 
        bump
    )]
    pub game: Account<'info, GameState>,
    #[account(mut)]
    pub creator: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UsurpThrone<'info> {
    #[account(mut, seeds = [b"game_v1"], bump)]
    pub game: Account<'info, GameState>,
    #[account(mut)]
    pub new_king: Signer<'info>, 
    
    /// CHECK: This is only used to receive lamports; constraint enforces it matches the current king pubkey stored on-chain.
    #[account(mut, constraint = previous_king.key() == game.king)] 
    pub previous_king: AccountInfo<'info>, 
    
    // --- SECURITY CHECK ---
    // The wallet passed here MUST match the one saved during initialization
    /// CHECK: Constraint locks this to the stored `fee_owner` pubkey; no data is read from the account.
    #[account(mut, constraint = creator.key() == game.fee_owner @ GameError::WrongFeeOwner)]
    pub creator: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ClaimJackpot<'info> {
    #[account(mut, seeds = [b"game_v1"], bump)]
    pub game: Account<'info, GameState>,
    #[account(mut)]
    pub king: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct GameState {
    pub king: Pubkey,
    pub price: u64,
    pub end_timestamp: i64,
    pub jackpot: u64,
    pub fee_owner: Pubkey,
}

#[event]
pub struct NewKingEvent {
    pub new_king: Pubkey,
    pub previous_king: Pubkey,
    pub price: u64,
    pub timestamp: i64,
}

#[error_code]
pub enum GameError {
    #[msg("The game has ended!")]
    GameEnded,
    #[msg("The game is not over yet!")]
    GameNotOver,
    #[msg("You are not the King!")]
    NotTheKing,
    #[msg("Security Alert: Someone tried to redirect fees to the wrong wallet!")]
    WrongFeeOwner,
}