// vegetable-before-candy
// Soroban smart contract for behavior-incentive platform
// Enforces: Task → Verification → Reward sequence

#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Symbol, Vec, token};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Task {
    pub id: u64,
    pub description: Symbol,
    pub status: TaskStatus,
    pub created_at: u64,
    pub completed_at: Option<u64>,
    pub verified_at: Option<u64>,
    pub reward_amount: i128,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum TaskStatus {
    Created,
    Submitted,
    Verified,
    Claimed,
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Tasks(Address), // user -> Vec<Task>
    TaskCounter,    // u64
    Admin,          // Address
    Token,          // Address (token contract for rewards)
}

#[contract]
pub struct VegetableBeforeCandy;

#[contractimpl]
impl VegetableBeforeCandy {
    // Initialize contract with admin and token
    pub fn initialize(env: Env, admin: Address, token: Address) {
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Token, &token);
        env.storage().instance().set(&DataKey::TaskCounter, &0u64);
    }

    // Create a new task with reward escrow
    pub fn create_task(env: Env, user: Address, description: Symbol, reward_amount: i128) -> u64 {
        user.require_auth();
        
        let token = env.storage().instance().get(&DataKey::Token).unwrap();
        let token_client = token::Client::new(&env, &token);
        
        // Transfer reward to contract escrow
        token_client.transfer(&user, &env.current_contract_address(), &reward_amount);
        
        let mut counter: u64 = env.storage().instance().get(&DataKey::TaskCounter).unwrap_or(0);
        counter += 1;
        env.storage().instance().set(&DataKey::TaskCounter, &counter);
        
        let task = Task {
            id: counter,
            description,
            status: TaskStatus::Created,
            created_at: env.ledger().timestamp(),
            completed_at: None,
            verified_at: None,
            reward_amount,
        };
        
        let mut user_tasks: Vec<Task> = env.storage().instance().get(&DataKey::Tasks(user.clone())).unwrap_or(Vec::new(&env));
        user_tasks.push_back(task);
        env.storage().instance().set(&DataKey::Tasks(user), &user_tasks);
        
        counter
    }

    // User submits task completion
    pub fn submit_completion(env: Env, user: Address, task_id: u64) {
        user.require_auth();
        
        let mut user_tasks: Vec<Task> = env.storage().instance().get(&DataKey::Tasks(user.clone())).unwrap();
        let task_index = user_tasks.iter().position(|t| t.id == task_id).unwrap();
        let mut task = user_tasks.get(task_index).unwrap();
        
        if task.status != TaskStatus::Created {
            panic!("Task not in created status");
        }
        
        task.status = TaskStatus::Submitted;
        task.completed_at = Some(env.ledger().timestamp());
        
        user_tasks.set(task_index, task);
        env.storage().instance().set(&DataKey::Tasks(user), &user_tasks);
    }

    // Oracle verifies task completion
    pub fn verify_task(env: Env, task_owner: Address, task_id: u64) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        
        let mut user_tasks: Vec<Task> = env.storage().instance().get(&DataKey::Tasks(task_owner.clone())).unwrap();
        let task_index = user_tasks.iter().position(|t| t.id == task_id).unwrap();
        let mut task = user_tasks.get(task_index).unwrap();
        
        if task.status != TaskStatus::Submitted {
            panic!("Task not submitted");
        }
        
        task.status = TaskStatus::Verified;
        task.verified_at = Some(env.ledger().timestamp());
        
        user_tasks.set(task_index, task);
        env.storage().instance().set(&DataKey::Tasks(task_owner), &user_tasks);
    }

    // User claims reward after verification
    pub fn claim_reward(env: Env, user: Address, task_id: u64) {
        user.require_auth();
        
        let mut user_tasks: Vec<Task> = env.storage().instance().get(&DataKey::Tasks(user.clone())).unwrap();
        let task_index = user_tasks.iter().position(|t| t.id == task_id).unwrap();
        let mut task = user_tasks.get(task_index).unwrap();
        
        if task.status != TaskStatus::Verified {
            panic!("Task not verified");
        }
        
        task.status = TaskStatus::Claimed;
        
        let token = env.storage().instance().get(&DataKey::Token).unwrap();
        let token_client = token::Client::new(&env, &token);
        
        // Transfer reward from contract to user
        token_client.transfer(&env.current_contract_address(), &user, &task.reward_amount);
        
        user_tasks.set(task_index, task);
        env.storage().instance().set(&DataKey::Tasks(user), &user_tasks);
    }

    // Get user's tasks
    pub fn get_user_tasks(env: Env, user: Address) -> Vec<Task> {
        env.storage().instance().get(&DataKey::Tasks(user)).unwrap_or(Vec::new(&env))
    }

    // Get specific task
    pub fn get_task(env: Env, user: Address, task_id: u64) -> Task {
        let user_tasks: Vec<Task> = env.storage().instance().get(&DataKey::Tasks(user)).unwrap();
        user_tasks.iter().find(|t| t.id == task_id).unwrap()
    }
}