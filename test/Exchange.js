const {expect}=require('chai')
const { ethers } = require("hardhat")

const supplyTokens=(n)=>{
    return ethers.utils.parseUnits(n.toString(),'ether')
}

describe("Exchange",()=>{
    let deployer,feeAccount,exchange,accounts,token1
    const feePercent=10
    

    beforeEach(async()=>{// this loop excutes before every "it" loop below
        const Exchange= await ethers.getContractFactory('Exchange')
        const Token= await ethers.getContractFactory('Token')
        
        token1=await Token.deploy('Ecorfy smart coin','ECORFY','1000000')
        token2=await Token.deploy('Mock Dai','mDAI','1000000')


        accounts=await ethers.getSigners()
        deployer=accounts[0]
        feeAccount=accounts[1]
        user1=accounts[2]

       
        let transaction =await token1.connect(deployer).transfer(user1.address,supplyTokens(100))
        await transaction.wait()
        exchange = await Exchange.deploy(feeAccount.address, feePercent)
        
    
    })
    describe('Deployment', () => {
       

        it("tracks the fee account",async ()=>{
        
            expect(await exchange.feeAccount()).to.equal(feeAccount.address)
        })

        it("tracks the fee percent",async ()=>{
        
            expect(await exchange.feePercent()).to.equal(feePercent)
        })
    
    
        
    });

    describe('Depositing Tokens', () => {
        let transaction,result
        let amount=supplyTokens(10)
       
        describe('Successs', () => {

            beforeEach(async()=>{// this loop excutes before every "it" loop below
                //approve token
                transaction=await token1.connect(user1).approve(exchange.address,amount)
                result=await transaction.wait()
                //deposit token
                transaction = await exchange.connect(user1).depositToken(token1.address,amount)
                result=await transaction.wait()
            })

            it('tracks the token deposit', async() => {
                expect(await token1.balanceOf(exchange.address)).to.equal(amount)
                expect(await exchange.tokens(token1.address,user1.address)).to.equal(amount)
                expect(await exchange.balanceOf(token1.address,user1.address)).to.equal(amount)
            });

            it('emits a deposit event',async()=>{
                const event = result.events[1]
                expect(event.event).to.equal('Deposit')
    
                 const args=event.args
                 expect(args.token).to.equal(token1.address)
                 expect(args.user).to.equal(user1.address)
                 expect(args.amount).to.equal(amount)
                 expect(args.balance).to.equal(amount)
            })
            
        });
        describe('Failure', () => {
            it('fails when no tokens are approved', async() => {
                await expect(exchange.connect(user1).depositToken(token1.address,amount)).to.be.reverted
            });

        });

    });

    describe('Withdrawing Tokens', () => {
        let transaction,result
        let amount=supplyTokens(10)
       
        describe('Successs', () => {

            beforeEach(async()=>{// this loop excutes before every "it" loop below
                //deposit tokens before withdrawing

                //approve token
                transaction=await token1.connect(user1).approve(exchange.address,amount)
                result=await transaction.wait()
                //deposit token
                transaction = await exchange.connect(user1).depositToken(token1.address,amount)
                result=await transaction.wait()

                // now withdraw Tokens
                transaction = await exchange.connect(user1).withdrawToken(token1.address,amount)
                result=await transaction.wait()

            })

            it('withdraw token funds', async() => {
                expect(await token1.balanceOf(exchange.address)).to.equal(0)
                expect(await exchange.tokens(token1.address,user1.address)).to.equal(0)
                expect(await exchange.balanceOf(token1.address,user1.address)).to.equal(0)
            });

            it('emits a withdraw event',async()=>{
                const event = result.events[1]
                expect(event.event).to.equal('Withdraw')
    
                 const args=event.args
                 expect(args.token).to.equal(token1.address)
                 expect(args.user).to.equal(user1.address)
                 expect(args.amount).to.equal(amount)
                 expect(args.balance).to.equal(0)
            })
            
        });
        describe('Failure', () => {
            it('fails for insufficient funds', async() => {
                // attempt to withdraw tokens without deposit the tokens
                await expect(exchange.connect(user1).depositToken(token1.address,amount)).to.be.reverted
            });

        });

    });

    describe('checking balances', () => {
        let transaction,result
        let amount=supplyTokens(10)
       

            beforeEach(async()=>{// this loop excutes before every "it" loop below
                //approve token
                transaction=await token1.connect(user1).approve(exchange.address,amount)
                result=await transaction.wait()
                //deposit token
                transaction = await exchange.connect(user1).depositToken(token1.address,amount)
                result=await transaction.wait()
            })

            it('returns user balance', async() => {
                expect(await token1.balanceOf(exchange.address)).to.equal(amount)
                
            });

    });

    describe('Making orders', async() => {
        let transaction,result

       let amount=supplyTokens(1)
       
       
        describe('Successs', async() => {
            beforeEach(async()=>{
                 //deposit tokens before making order

                //approve token
                transaction=await token1.connect(user1).approve(exchange.address,amount)
                result=await transaction.wait()
                //deposit token
                transaction = await exchange.connect(user1).depositToken(token1.address,amount)
                result=await transaction.wait()

                // Make order
                transaction = await exchange.connect(user1).makeOrder(token2.address,amount,token1.address,amount)
               


            })

            it('tracks the newly created order', async() => {
                expect(await exchange.orderCount()).to.equal(1)
                
            });
            
            
        });
        describe('Failure', () => {
             
        });

    });
    
})