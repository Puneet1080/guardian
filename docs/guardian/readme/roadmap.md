# 🛣 Roadmap

To get more information on Roadmap, please click: [https://app.zenhub.com/workspaces/guardian-618c27c08661c0001461263a/roadmap?invite=true](https://app.zenhub.com/workspaces/guardian-618c27c08661c0001461263a/roadmap?invite=true)

## ---- January 2024----

### Implement discontinuing policy workflow

Implement the policy deprecation workflow which includes:

* Guardian UI allowing issuing SR to discontinue a policy (version) or the entire policy from a certain date (in the future or 'now').
* Policy grid should display a suitable marker against non-active policies, and a different for the ones soon expiring.
* An appropriate message posted in the corresponding Hedera topic recording the 'discontinuing' decision
* For in-progress projects that have been registered and are operating under the policy it should be possible to 'switch' to the appropriate version of the policy which is still valid.

Referral Link : [https://github.com/hashgraph/guardian/issues/2030](https://github.com/hashgraph/guardian/issues/2030)

### Gold Standard’s Carbon Sequestration through Accelerated Carbonation of Concrete Aggregate Webinar

* Design schemas for the Carbon Sequestration through Accelerated Carbonation of Concrete Aggregate methodology, create a PowerPoint presentation, and conduct webinar.
* Development of the policy using the schemas and workflow designed

Referral Link : [https://github.com/hashgraph/guardian/issues/2321](https://github.com/hashgraph/guardian/issues/2321)

### Business User Policy Development Feature - schemas MVP

* Create a excel 'schema representation' standard suitable for non-technical users. _Note: use existing excel schemas from Tools and UNFCCC initiatives as guidance._
* Create an explicit template for the above, downloadable from Guardian UI, which users can take and update/change to develop new schemas.
* Create an Export/Import UI and tooling which would allow seamless transformation of schemas written in Excel into valid Guardian JSON schemas and vice versa
* Ensure manual interventions are possible for corrections/adjustments of complex formulas and other issues.

Referral Link : [https://github.com/hashgraph/guardian/issues/1885](https://github.com/hashgraph/guardian/issues/1885)

### Geographic raster imagery support in Guardian

Introduce support for geoTIFF and other raster types of data such that:

* Guardian documents (i.e. in schemas) can reference raster data (in geoTIFF and other common formats) which are located on external (3rd party) systems.
* Guardian UI can display raster images and their georeferencing data when they are encountered in documents.
* Guardian policy can access and manipulate (use in calculations, etc) data from raster sources.

Referral Link : [https://github.com/hashgraph/guardian/issues/1930](https://github.com/hashgraph/guardian/issues/1930)

### Development of ACM0007: Conversion from Single Cycle to Combined Cycle Power Generation

Designing of the Schema and getting it approved. Development of the policy using Schema Development of all the tools involved in the policy:

* Tool 02- Combined tool to identify the baseline scenario and demonstrate additionality
* Tool 03- Tool to calculate project or leakage CO2 emissions from fossil fuel combustion
* Tool 07- Tool to calculate the emission factor for an electricity system
* Tool 10- Tool to determine the remaining lifetime of equipment

Referral Link : [https://github.com/hashgraph/guardian/issues/2883](https://github.com/hashgraph/guardian/issues/2883)

## ---- February 2024----

### Support externally controlled DIDs with keys in Guardian

Introduce a workflow into the Guardian where a DID Controller would introduce a dedicated verification method into the main DID for which the private key would be stored and managed by a Guardian instance. This way Guardian would only be able to control the specific verification method's key, but not the rest of the DID.

Referral Link : [https://github.com/hashgraph/guardian/issues/2678](https://github.com/hashgraph/guardian/issues/2678)

### Development of AMS-I.D: Grid Connected Renewable Electricity Generation – v.18.0

Designing of the Schema and getting it approved.\
Development of the policy using Schema\
Development of all the tool involved in the policy

Referral Link : [https://github.com/hashgraph/guardian/issues/2919](https://github.com/hashgraph/guardian/issues/2919)

### Mitigation Credits Research

Introduce the ability to mint Mitigation Asset Type tokens as the result of the calculation of the diff between planned (and reported on the Environmental) and actual results of the calculations based on the MRV data for a reporting period. This would likely require:

* New type of blocks in the policy definition language specifying 'target' numbers.
* Policy Engine ability to mint different types of tokens depending on the conditions
* Needs to be linked with [GHG scorecards Research #1017](https://github.com/hashgraph/guardian/issues/1017) logic

Referral Link : [https://github.com/hashgraph/guardian/issues/54](https://github.com/hashgraph/guardian/issues/54)

### FireBlocks/ Meetaco Integration

We need to integrate FireBlocks , a Key management tool to manage the Keys and secure Guardian. To get complete info on Fireblocks, please look at [https://www.fireblocks.com/](https://www.fireblocks.com/)

Referral Link : [https://github.com/hashgraph/guardian/issues/1314](https://github.com/hashgraph/guardian/issues/1314)

## ---- March 2024----

### Conforming to Hedera DID, VC, VP, Standards

Update to memo field VP/DID structure to normalize DID spec with the rest of Hedera DID method work (which will also be updated)

Referral Link : [https://github.com/hashgraph/guardian/issues/2211](https://github.com/hashgraph/guardian/issues/2211)

### Remove requirement for hardcoded (error prone) status options

The ability to define states and to link it to a type, perhaps been able to link a button or UI to a set of states. There should be warnings for modifying, a state label or title within the UI, whereby it makes it harder for an asset to be identified. In addition, the validation check should ensure that the correct states have been selected for button objects or other like-UI, to reduce the time and frustration hardcoding different states.

In short, standardizing all state options for all policies -- perhaps having a new type of button that is linked to a custom state list/enum sat with drop-down links could be the way to go.

The states could be anything, but the goal would be to be standardized throughout all policies:

* approved
* rejected
* etc

While this is good for the demand side of value extraction. This is highly beneficial for the creator of policies as you could select the correct value from a state-list drop down instead of having to hardcode all state options for button, selection or filters for approved or rejected states.

Referral Link : [https://github.com/hashgraph/guardian/issues/2791](https://github.com/hashgraph/guardian/issues/2791)

### Development of PWRM0002 Plastic Waste Recycling Methodology, v1.1

Designing of the Schema and getting it approved.&#x20;

Development of the policy using Schema&#x20;

Development of all the tool involved in the policy

Referral Link : [https://github.com/hashgraph/guardian/issues/2920](https://github.com/hashgraph/guardian/issues/2920)

### DLT to Address Flawed Methodologies Blog

Draft and published a blog post on the topic of DLT as a solution to address poor data quality and flawed emission and carbon credit methodologies.

Referral Link : [https://github.com/hashgraph/guardian/issues/2906](https://github.com/hashgraph/guardian/issues/2906)

## ---- April 2024----

### Full project data comparison as produced/captured by policies

Introduce a comparison functionality where it'd be possible to 'diff' arbitrary sections or the entire trust-chains for different tokens, potentially issued by different policies such that the system would:

* graphically display the differences where a user would then be able to 'scroll' through and review them in the UI
* get a numerical 'similarity score' indicating how similar the two 'chains' are

Referral Link : [https://github.com/hashgraph/guardian/issues/2704](https://github.com/hashgraph/guardian/issues/2704)

### Hedera interactions resilience module

Create a Guardian 'transaction execution' service which would assure orderly transaction execution and their status tracking, and provide intelligent retry and failure recovery functionality such that required transactions would be guaranteed to be asynchronously executed once, and only once, and in the right order.

Referral Link : [https://github.com/hashgraph/guardian/issues/2905](https://github.com/hashgraph/guardian/issues/2905)

### Scaling Guardian to enterprise workloads

* make necessary changes to Guardian and document hardware (DevOps) configuration such that deployed instances would satisfy performance parameters specified in the 'acceptance criteria' section below.
* review and where needed revamp FE<->BE communication (i.e. FE updates are too frequent and thus too taxing on BE, they need to be better batched and sent together)
* potentially introduce caching in FE, between FE and BE, and possibly between BE and the DB and/or Hedera & IPFS (for examples there are cases when immutable documents, schemas, etc which don't change there are unecessarily reloaded or resent)
* implement memory usage optimisation, potentially in-memory compression to make sure the services don't blow up the RAM of the cloud "hardware"
* Prove with practical testing that Guardian can fulfil acceptance criteria requirements below

Referral Link : [https://github.com/hashgraph/guardian/issues/3016](https://github.com/hashgraph/guardian/issues/3016)

### Development of AMS-III.AU: Methane Emission Reduction by Adjusted Water Management Practice in Rice Cultivation – v.4.0

Designing of the Schema and getting it approved.&#x20;

Development of the policy using Schema&#x20;

Development of all the tool involved in the policy

Referral Link : [https://github.com/hashgraph/guardian/issues/2921](https://github.com/hashgraph/guardian/issues/2921)

## ---- May 2024----

### Revamp Guardian user/roles and permissions model

* Fundamentally separate the concept of users, roles and permissions in Guardian
* Introduce granular concept of permissions which could be assigned to users, a user could then perform a specific function within the role if its assigned role 'contains' this permission. These should include (but not limited to):
  * Policy edit/submit for review
  * Policy view
  * Policy approval & publish
* Introduce a "user admin" role, which allows:
  * defining new roles from permissions
  * assigning of roles to users
* Create a permissioning system which verifies actor role before any action has been taken throughout Guardian
* Package in suitable most-common role set into Guardian so it can be operated immediately 'out of the box' without the need for additional configuration
* Create a concept of 'delegation' where a user with a particular role/permission can explicitly 'delegate' this role/permission to another user
* Introduce the functionality to produce a report (page, download) which lists all users and their roles/permissions mapping in the system

Referral Link : [https://github.com/hashgraph/guardian/issues/2844](https://github.com/hashgraph/guardian/issues/2844)

### Conform Guardian generated NFTs with HIP412 for better ecosystem-wide compatibility for NFTs and wallets

1. Define senisble defaults for all NFT Guardian assets that is the minimum implementation of HIP412 ([@mattsmithies](https://github.com/mattsmithies) can advise on tooling or a method to support)
2. Move the generated of the current metadata to the _"properties"_ field of the [HIP412 Specification](https://hips.hedera.com/hip/hip-412#specification)
3. Allow marketplaces to change the defaults for their specific needs on the creation of tokens and more importantly the mint of assets.

Referral Link : [https://github.com/hashgraph/guardian/issues/1672](https://github.com/hashgraph/guardian/issues/1672)

### Allow users chose sync/async execution of an API call

Introduce a way for the client (API using) applications to specify that a particular API call should be executed synchronously. Enable such calls to return extended information about the call results since more information is available after the chain has been executed (for example 'message ID' of the document published in IPFS).

Referral Link : [https://github.com/hashgraph/guardian/issues/1986](https://github.com/hashgraph/guardian/issues/1986)

### Development of VMR0006: Energy Efficiency and Fuel Switch Measures in Thermal Applications, v1.2v

Designing of the Schema and getting it approved.&#x20;

Development of the policy using Schema&#x20;

Development of all the tool involved in the policy

Referral Link : [https://github.com/hashgraph/guardian/issues/2922](https://github.com/hashgraph/guardian/issues/2922)

## ---- June 2024----

### Further evolution of policy comparison (a.k.a 'mass diff')

Relying on the work done in the course of [#1793](https://github.com/hashgraph/guardian/issues/1793) (i.e. creating data structures (hashes) to enable more efficient comparison), allow for mass-comparison of policies such that a user should be able to search for local policies 'similar' to 'different' to some other policy based on some similarity threshold. This is related (but different) to [#2281](https://github.com/hashgraph/guardian/issues/2281) as it focuses on 'easy diff' vs 'easy search'.

Referral Link : [https://github.com/hashgraph/guardian/issues/2706](https://github.com/hashgraph/guardian/issues/2706)

### Guardian Oracle service to verify token trust chain from within Hedera smart contracts

Develop a Guardian 'Oracle' service to produce (at least) a verifiable binary valid/not valid answer for a given token or group of tokens reachable from within the smart contract, which can then form the basis conditional operation inside the smart contract.

Referral Link : [https://github.com/hashgraph/guardian/issues/1040](https://github.com/hashgraph/guardian/issues/1040)

### Development of AMS-I.E: Switch from Non-Renewable Biomass for Thermal Applications by the User – v.13.0

Designing of the Schema and getting it approved.&#x20;

Development of the policy using Schema&#x20;

Development of all the tool involved in the policy

Referral Link : [https://github.com/hashgraph/guardian/issues/2923](https://github.com/hashgraph/guardian/issues/2923)

### HBAR GHG Policy Research

Create a Guardian policy that quantifies and reports GHG emissions from HBAR, using the GHGP product Standard and ICT Sector Guidance for guidance and requirements mapping.

{% embed url="https://ghgprotocol.org/sites/default/files/standards/Product-Life-Cycle-Accounting-Reporting-Standard_041613.pdfhttps://ghgprotocol.org/sites/default/files/GHGP-ICTSG%20-%20ALL%20Chapters.pdf" %}

Referral Link : [https://github.com/hashgraph/guardian/issues/1667](https://github.com/hashgraph/guardian/issues/1667)

## ---- July 2024----

### Auto-testing community submitted policies

* Relying on the [Policy equivalence assessment based on their execution results for the same data #1886](https://github.com/hashgraph/guardian/issues/1886) and [Full project data comparison as produced/captured by policies #2704](https://github.com/hashgraph/guardian/issues/2704) introduce capability to automatically and repeatably test policies
* Introduce a hook into the new policy merge and release build events which triggers execution of the community policies regression test cycle

Referral Link : [https://github.com/hashgraph/guardian/issues/2847](https://github.com/hashgraph/guardian/issues/2847)

### Code audit: support and resolution of issues

* Define scope and organise code audit and application penetration testing by a reputable 3rd party security firm.
* Support audit team with Q\&A and setting up environments etc
* Resolve critical issues found.

Referral Link : [https://github.com/hashgraph/guardian/issues/2989](https://github.com/hashgraph/guardian/issues/2989)

### Development of GS Methodology for Emission Reductions from Safe Drinking Water Supply v.1.0

Designing of the Schema and getting it approved.&#x20;

Development of the policy using Schema&#x20;

Development of all the tool involved in the policy

Referral Link : [https://github.com/hashgraph/guardian/issues/2924](https://github.com/hashgraph/guardian/issues/2924)

### GHG scorecards Research

* Identify the KPIs (and the data requirements behind them) to be captured by the Environmental scorecards to best support demand signaling.
* Identify the business requirements for the Environmental Scorecards, i.e., how they could be used by supply and demand-side actors, markets, etc.?

Referral Link : [https://github.com/hashgraph/guardian/issues/1017](https://github.com/hashgraph/guardian/issues/1017)

### Global environmental/Guardian data search (indexer) component for Hedera and IPFS

* Improve the data storage and indexing capabilities of Guardian for the data belonging to the local instance such that complex analytical queries could be run efficiently, such as 'search for data similar to this' and 'what is the possibility of this being a double entry for something submitted elsewhere'.
* Introduce a global search and indexing capability for data produce by other (all) instances such that queries above could be run on the entire body of Guardian data produced from the beginning of time (in blockchain sense).
* Extend [Block and policy discoverability/search #2281](https://github.com/hashgraph/guardian/issues/2281) for users to be able to preview the usage of the block without having to import "other SR's" policy into their Guardian instance

Referral Link : [https://github.com/hashgraph/guardian/issues/2629](https://github.com/hashgraph/guardian/issues/2629)
