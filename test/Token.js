const {expect}=require('chai')
const { ethers } = require("hardhat")

const supplyTokens=(n)=>{
    return ethers.utils.parseUnits(n.toString(),'ether')
}

describe("Token",()=>{
    let token, accounts, deployer,receiver, exchange
    

    beforeEach(async()=>{// this loop excutes before every "it" loop below
        // fetch the token from block chain
        const Token= await ethers.getContractFactory('Token')
        token = await Token.deploy('Ecorfy smart coin','ECORFY','1000000')
        
        accounts=await ethers.getSigners()
        deployer=accounts[0]
        receiver=accounts[1]
        exchange=accounts[2]
    
    })
    describe('Deployment', () => {
        const name='Ecorfy smart coin'
        const symbol='ECORFY'
        const decimal='18'
        const totalSupply=supplyTokens('1000000')

        it("has correct name",async ()=>{
        
            //read the Token name
           // const name = await token.name()
            //check that name is correct
            expect(await token.name()).to.equal(name)
        })
    
        it("has correct symbol",async ()=>{
            
            //read the Token name
           // const symbol = await token.symbol()
            //check that name is correct
            expect(await token.symbol()).to.equal(symbol)
        })
    
        it("has correct decimals",async ()=>{
            expect(await token.decimals()).to.equal(decimal)
        })
    
        it("has correct total supply",async ()=>{
            // expect(await token.totalSupply()).to.equal("1000000000000000000000000") // Wei standards, it takes 18 decimal places
            //another way of doing above step
            //const value=ethers.utils.parseUnits('1000000','ether') // this command tells conver 1-million ether into Wei standard
            //we make the above statement in to an function that can take dynamic values 
            expect(await token.totalSupply()).to.equal(totalSupply)// resultant test command
        })
        it("assigns total supply to deployer",async ()=>{
            expect(await token.balanceOf(deployer.address)).to.equal(totalSupply)
        })
    });

    describe('Sending Token', () => {

        let amount, transaction,result
        describe('Success',()=>{
            beforeEach(async()=>{
                amount=supplyTokens(100)
                transaction=await token.connect(deployer).transfer(receiver.address,amount)
                result = await transaction.wait()
            })
            it('Transfer token balances', async() => {
    
                expect(await token.balanceOf(deployer.address)).to.equal(supplyTokens(999900))
                expect(await token.balanceOf(receiver.address)).to.equal(amount)
    
             
            });
            it('emits a transfer event',async()=>{
                const event = result.events[0]
                expect(event.event).to.equal('Transfer')
    
                 const args=event.args
                 expect(args.from).to.equal(deployer.address)
                 expect(args.to).to.equal(receiver.address)
                 expect(args.value).to.equal(amount)
            })
        })

         describe('Failure', () => {
            it('rejects insufficient balances', async() => {
                const invalid_amount=supplyTokens(10000000)
               await expect(token.connect(deployer).transfer(receiver.address,invalid_amount)).to.be.reverted

            });

            it('rejects invalid recipent', async() => {
                const amount=supplyTokens(100)
                await expect(token.connect(deployer).transfer('0x0000000000000000000000000000000000000000',amount)).to.be.reverted
            });
            
            
        });
        

        
        
    });

    describe('Approving tokens', () => {
        let amount, transaction, result
        beforeEach(async ()=>{
            amount=supplyTokens(100)
            transaction=await token.connect(deployer).approve(exchange.address,amount)
            result = await transaction.wait()
        })

        describe('Success', () => {
            it('allocates an allowance for delegated token spending', async() => {
                expect(await token.allowance(deployer.address,exchange.address)).to.equal(amount)
            });

            it('emits an Approval event',async()=>{
                const event = result.events[0]
                expect(event.event).to.equal('Approval')
    
                 const args=event.args
                 expect(args.owner).to.equal(deployer.address)
                 expect(args.spender).to.equal(exchange.address)
                 expect(args.value).to.equal(amount)
            })
            
            
        });
        describe('Failure', () => {
            it('rejects invalid senders', async() => {
                await expect(token.connect(deployer).approve('0x0000000000000000000000000000000000000000000000',amount))
            });
            
        });

        
        
    });
    
    describe('Delegated Token Transfer', () => {

        let amount, transaction, result
        beforeEach(async ()=>{
            amount=supplyTokens(100)
            transaction=await token.connect(deployer).approve(exchange.address,amount)
            result = await transaction.wait()
        })

        describe('Success', () => {
            
        beforeEach(async ()=>{
           
            transaction=await token.connect(exchange).transferFrom(deployer.address,receiver.address,amount)
            result = await transaction.wait()
        })
            it('Tranfer token balances', async() => {
                expect(await token.balanceOf(deployer.address)).to.equal(ethers.utils.parseUnits('999900','ether'))
                expect(await token.balanceOf(receiver.address)).to.equal(amount)
                
            });
            it('resets the allowance', async() => {
                expect(await token.allowance(deployer.address,exchange.address)).to.be.equal(0)

            });
            it('emits an Approval event',async()=>{
                const event = result.events[0]
                expect(event.event).to.equal('Transfer')
    
                 const args=event.args
                 expect(args.from).to.equal(deployer.address)
                 expect(args.to).to.equal(receiver.address)
                 expect(args.value).to.equal(amount)
            })
            
            
        });

        describe('Failure', () => {
            it('Rejects insufficient amounts', async () => {
                const invalidAmount = supplyTokens(100000000)
                await expect(token.connect(exchange).transferFrom(deployer.address, receiver.address, invalidAmount)).to.be.reverted
            })
        });
        
        
    });
    
    
    
})