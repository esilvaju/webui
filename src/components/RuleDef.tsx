import React, { useState } from 'react'
import { Steps } from '../stories/Steps/Steps'
import { Button } from '../stories/Button/Button'
import { Input } from '../stories/Input/Input'
import { ToggleSwitch } from '../stories/ToggleSwitch/ToggleSwitch'
import { Dropdown } from '../stories/Dropdown/Dropdown'
import { AlertProps } from '../stories/Alert/Alert'
import { Card } from '../stories/Card/Card'
import { Tabs } from '../stories/Tabs/Tabs'
import { ModalProps } from '../stories/Modal/Modal'
import { DIDModel } from '../utils/models'
import { useAlert, useModal } from './GlobalHooks'
import { RucioClient } from '../client'
import { Separator } from '../stories/Separator/Separator'

export const RuleDef = () => {
    const showModal: (options: ModalProps) => Promise<void> = useModal()
    const showAlert: (options: AlertProps) => Promise<void> = useAlert()

    const [selectedStep, setSelectedStep] = useState(0 as number)
    const [dataPatternValue, setDataPatternValue] = useState('' as string)
    const [listEntered, setListEntered] = useState('' as string)
    const [rseexpressionEnabled, setRSEexpressionEnabled] = useState(
        false as boolean,
    )
    const [didSearchMethod, setDidSearchMethod] = useState(0 as number)
    const [isCheckedApproval, setIsChecked] = useState(false as boolean)
    const [copiesAmountEntered, setCopiesAmountEntered] = useState(1 as number)
    const [DIDEntries, setDIDEntries] = useState<string[]>([])

    const DID = () => {
        const [didEntries, setdidEntries] = useState([] as DIDModel[])
        const [granularityLevel, setGranularityLevel] = useState(
            'collection' as string,
        )
        const [recordAmountEntered, setRecordAmountEntered] = useState(
            '10' as string,
        )
        const [dataPatternEntered, setDataPatternEntered] = useState(
            false as boolean,
        )
        const [checkedDIDs, setCheckedDIDs] = useState(new Array(10).fill(true))
        const [filterEntered, setFilterEntered] = useState('' as string)

        const handleDIDListChange = function (position: number) {
            checkedDIDs[position] = !checkedDIDs[position]
            setCheckedDIDs(checkedDIDs)
        }

        const extract_scope = (name: any): string[] => {
            if (name.indexOf(':') > -1) {
                return name.split(':')
            }
            const items = name.split('.')
            if (items.length <= 1) {
                throw Error('')
            }
            let scope = items[0]
            if (name.indexOf('user') === 0 || name.indexOf('group') === 0) {
                scope = items[0] + '.' + items[1]
            }
            return [scope, name]
        }

        const updateDidEntries = (newDIDArray: DIDModel[]) => {
            setdidEntries(prevDIDArray => [...prevDIDArray, ...newDIDArray])
        }

        const searchDids = () => {
            const [scope, name] = extract_scope(dataPatternValue.trim())
            if (!scope) {
                return 'cannot determine scope. please provide the did with scope'
            }
            RucioClient.DID.search(scope, name, granularityLevel).then(
                (data: any) => {
                    const dids = [] as DIDModel[]
                    for (const did of data) {
                        const didObj = new DIDModel(did)
                        dids.push(didObj)
                    }
                    updateDidEntries(dids)
                },
            )
        }
        return (
            <Card
                content={
                    <>
                        <h6>
                            &#9888;&nbsp;Please start by entering a DID or DID
                            wildcard and search for either containers or
                            datasets. Then select the requested DIDs. Do not use
                            a trailing '/' for containers.
                        </h6>
                        <h6>
                            &#9888;&nbsp;To learn more about DIDs,
                            <a
                                onClick={() => {
                                    showModal({
                                        title: 'DID',
                                        body: (
                                            <>
                                                <p>
                                                    Files, datasets and
                                                    containers share the same
                                                    naming convention, which is
                                                    composed of two strings: the
                                                    scope and the name,
                                                    separated by a colon. The
                                                    combination of scope and
                                                    name is called a data
                                                    identifier (DID).
                                                </p>
                                                <p>
                                                    The scope is used to divide
                                                    the name space into several,
                                                    separate sub spaces for
                                                    production and individual
                                                    users. User scope always
                                                    start with <em>user.</em>" "
                                                    followed by the account
                                                    name.
                                                </p>
                                                <p>
                                                    By default users can read
                                                    from all scopes but only
                                                    write into their own one.
                                                    Only privileged accounts
                                                    have the right to write into
                                                    multiple scopes including
                                                    production scopes like
                                                    <em>mc15_13TeV.</em>
                                                </p>
                                                <Separator />
                                                <p>Examples:</p>
                                                <strong>
                                                    Official dataset:
                                                </strong>

                                                <br />
                                                <em>
                                                    data15_13TeV.00266904.physics_Main.
                                                </em>

                                                <br />
                                                <em>merge.DAOD_SUSY1.</em>
                                                <br />
                                                <em>
                                                    f594_m1435_p2361_tid05608871_00
                                                </em>
                                                <br />
                                                <strong>User dataset:</strong>

                                                <br />
                                                <em>ser.jdoe:my.dataset.1</em>
                                            </>
                                        ),
                                    })
                                }}
                            >
                                &nbsp;click here
                            </a>
                            .
                        </h6>
                        <Separator />
                        <Tabs
                            tabs={['DID Search Pattern', 'List of DIDs']}
                            active={didSearchMethod}
                            handleClick={() => {
                                didSearchMethod === 0
                                    ? setDidSearchMethod(1)
                                    : setDidSearchMethod(0)
                            }}
                        />
                        {didSearchMethod === 0 ? (
                            <>
                                <div className="data_pattern rucio-flex">
                                    <Input
                                        label="Data Pattern"
                                        name="pattern"
                                        placeholder="scope:name"
                                        value={dataPatternValue}
                                        focusByDefault
                                        type="text"
                                        onChange={(event: any) => {
                                            setDataPatternValue(
                                                event?.target?.value,
                                            )
                                        }}
                                    ></Input>
                                    <div className="m-t-28">
                                        <Button
                                            label="Search"
                                            kind="primary"
                                            type="button"
                                            size="large"
                                            disabled={
                                                dataPatternValue.length === 0
                                            }
                                            onClick={() => {
                                                setDataPatternEntered(true)
                                                try {
                                                    searchDids()
                                                } catch (error) {
                                                    showAlert({
                                                        message: error,
                                                        variant: 'error',
                                                    })
                                                }
                                            }}
                                        />
                                    </div>
                                </div>

                                {dataPatternEntered ? (
                                    <>
                                        <div className="rucio-flex m-5">
                                            <Input
                                                name="filter"
                                                label="Filter"
                                                type="text"
                                                size="medium"
                                                show="rounded"
                                                placeholder="Filter"
                                                onChange={(event: any) => {
                                                    setFilterEntered(
                                                        event?.target?.value,
                                                    )
                                                }}
                                            />
                                            <div className="rucio-flex m-t-20 ">
                                                <Dropdown
                                                    label="Show"
                                                    options={[
                                                        '10',
                                                        '25',
                                                        '50',
                                                        '100',
                                                    ]}
                                                    handleChange={(
                                                        event: any,
                                                    ) => {
                                                        setRecordAmountEntered(
                                                            event?.target
                                                                ?.value,
                                                        )
                                                    }}
                                                />

                                                <Dropdown
                                                    label={
                                                        'Level of Granularity'
                                                    }
                                                    options={[
                                                        'dataset',
                                                        'container',
                                                        'collection',
                                                        'file',
                                                    ]}
                                                    handleChange={(
                                                        event: any,
                                                    ) => {
                                                        setGranularityLevel(
                                                            event?.target
                                                                ?.value,
                                                        )
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <div className="list_entries">
                                            {didEntries.map((entry, index) => (
                                                <>
                                                    <br />
                                                    <label>
                                                        <input
                                                            key={`custom-checkbox-${index}`}
                                                            type="checkbox"
                                                            checked={
                                                                checkedDIDs[
                                                                    index
                                                                ]
                                                            }
                                                            onChange={() => {
                                                                handleDIDListChange(
                                                                    index,
                                                                )
                                                            }}
                                                        />
                                                        &nbsp;{entry?.id}
                                                    </label>
                                                </>
                                            ))}
                                        </div>
                                    </>
                                ) : null}
                                <Separator />
                                <div
                                    className="next_button"
                                    style={{ float: 'right' }}
                                >
                                    <Button
                                        label="Next&nbsp;&#8250;"
                                        kind="outline"
                                        type="submit"
                                        size="medium"
                                        show="invisible"
                                        disabled={
                                            granularityLevel.length === 0 &&
                                            recordAmountEntered.length === 0 &&
                                            filterEntered.length === 0
                                        }
                                        onClick={() => {
                                            setSelectedStep(1)
                                        }}
                                    />
                                </div>
                            </>
                        ) : (
                            <>
                                &nbsp;
                                <textarea
                                    style={{
                                        borderRadius: '5px',
                                        padding: '0px 10px 10px 10px',
                                        width: '100%',
                                    }}
                                    cols={130}
                                    rows={12}
                                    autoFocus={true}
                                    placeholder={
                                        'If you want to create a rule for several DIDs without a pattern, here you can enter them, one DID per line'
                                    }
                                    value={listEntered}
                                    onChange={(event: any) => {
                                        setListEntered(event.target.value)
                                        setDidSearchMethod(didSearchMethod)
                                    }}
                                ></textarea>
                                <div className="next_button">
                                    <Button
                                        label="Next&nbsp;&#8250;"
                                        kind="outline"
                                        type="submit"
                                        show="invisible"
                                        disabled={listEntered.length === 0}
                                        onClick={() => {
                                            setSelectedStep(1)
                                        }}
                                    />
                                </div>
                            </>
                        )}
                    </>
                }
            />
        )
    }

    const RSE = () => {
        const [rseexpressionvalueEntered, setRseexpressionvalueEntered] =
            useState('' as string)
        const [RSEInfoOpened, setRSEInfoOpened] = useState(false as boolean)

        return (
            <Card
                content={
                    <>
                        <h6>
                            &#9888;&nbsp;To learn more about RSEs,{' '}
                            <a
                                onClick={() => {
                                    showModal({
                                        title: 'RSE',
                                        body: (
                                            <>
                                                <p>
                                                    Rucio Storage Elements
                                                    (RSEs) are storage endpoints
                                                    at sites, where data is
                                                    written to. They can have
                                                    different types like
                                                    DATADISK or LOCALGROUPDISK,
                                                    which are subject to
                                                    different permissions and
                                                    policies.
                                                </p>
                                                <p>
                                                    RSEs have a set of
                                                    attributes assigned to them
                                                    so that they can be grouped
                                                    in different ways, e.g., all
                                                    UK RSEs or all Tier-1 RSEs.
                                                    Those attributes can be used
                                                    to compose RSE expressions,
                                                    which can be applied if you
                                                    don't explicitly want to
                                                    have the data replicated to
                                                    one specific RSE.
                                                </p>
                                                <p>
                                                    Accounts in Rucio have quota
                                                    set per RSEs that specify
                                                    where one account can write
                                                    data and how much. A
                                                    detailed explanation about
                                                    permissions and quotas in
                                                    Rucio can be found on this
                                                    <a href="https://twiki.cern.ch/twiki/bin/viewauth/AtlasComputing/RucioClientsHowTo#Permissions_and_quotas">
                                                        " " twiki
                                                    </a>
                                                    " " page.
                                                </p>
                                                <Separator />
                                                <p>Examples:</p>
                                                <p>
                                                    Replicate to any
                                                    LOCALGROUPDISK in the US
                                                    cloud:" "
                                                    <em>
                                                        cloud=UStype=LOCALGROUPDISK
                                                    </em>
                                                </p>
                                                <p>
                                                    Replicate to any Tier-1
                                                    SCRATCHDISK but not
                                                    RAL-LCG2:" "
                                                    <em>
                                                        tier=1type=SCRATCHDISK\site=RAL-LCG2
                                                    </em>
                                                </p>
                                            </>
                                        ),
                                    })
                                }}
                            >
                                click here.
                            </a>
                        </h6>
                        <Separator />
                        <div className="rucio-flex data_pattern">
                            <Input
                                label=""
                                name="rse"
                                placeholder={
                                    'Please enter an RSE or an RSE expression'
                                }
                                onChange={(event: any) => {
                                    setRseexpressionvalueEntered(
                                        event.target.value,
                                    )
                                }}
                            />
                            <Button
                                label="Check Quota"
                                kind="primary"
                                type="button"
                                size="large"
                                disabled={
                                    rseexpressionvalueEntered.length === 0
                                }
                                onClick={() => {
                                    setRSEexpressionEnabled(true)
                                }}
                            />
                        </div>
                        {rseexpressionEnabled ? (
                            <>
                                <label>
                                    Total size of selected DIDs: 30 TB
                                </label>
                                <table style={{ width: '50%' }}>
                                    <thead>
                                        <th>RSE</th>
                                        <th>Remaining Quota</th>
                                        <th>Total Quota</th>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>SCRATCHDISK</td>
                                            <td>10.5 TB</td>
                                            <td>10.5 TB</td>
                                        </tr>
                                        <tr>
                                            <td>UKI-NORTHGRID</td>
                                            <td>13.19 TB</td>
                                            <td>13.19 TB</td>
                                        </tr>
                                    </tbody>
                                </table>
                                &nbsp;
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={isCheckedApproval}
                                        onChange={(event: any) => {
                                            setIsChecked(!isCheckedApproval)
                                        }}
                                    />
                                    &nbsp;I want to ask for approval
                                </label>
                            </>
                        ) : null}
                        <Separator />
                        <div style={{ float: 'left' }}>
                            <Button
                                label="&#x2039;&nbsp;Back"
                                kind="outline"
                                type="submit"
                                show="invisible"
                                size="medium"
                                onClick={(event: any) => {
                                    setSelectedStep(0)
                                }}
                            />
                        </div>
                        <div style={{ float: 'right' }}>
                            <Button
                                label="Next&nbsp;&#8250;"
                                kind="outline"
                                type="submit"
                                show="invisible"
                                size="medium"
                                disabled={!rseexpressionEnabled}
                                onClick={(event: any) => {
                                    setSelectedStep(2)
                                }}
                            />
                        </div>
                    </>
                }
            />
        )
    }

    const Options = () => {
        const [lifetimeEntered, setLifetimeEntered] = useState(new Date())
        const [samplesAmountEntered, setsamplesAmountEntered] = useState(
            0 as number,
        )
        const [asynchModeEnabled, setAsynchModeEnabled] = useState(
            true as boolean,
        )
        const [notificationsEnabled, setNotificationsEnabled] = useState(
            true as boolean,
        )
        const [advancedEnabled, setAdvancedEnabled] = useState(false as boolean)
        const [optionsOpened, setOptionsOpened] = useState(false as boolean)
        const [groupingEntered, setGroupingEntered] = useState('' as string)
        const [commentEntered, setCommentEntered] = useState('' as string)

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            setAsynchModeEnabled(e.target.checked)
        }

        return (
            <Card
                content={
                    <>
                        <h6>
                            &#9888;&nbsp;To learn more about Options,
                            <a
                                onClick={() => {
                                    showModal({
                                        title: 'RSE',
                                        body: (
                                            <>
                                                <p>
                                                    <b>Lifetime: </b>The
                                                    lifetime is specified in
                                                    days and defines when a rule
                                                    will be deleted again. For
                                                    SCRATCHDISK the maximum
                                                    lifetime is 15 days and for
                                                    everything else you can
                                                    choose any number of days or
                                                    leave it empty to set no
                                                    lifetime at all.
                                                </p>
                                                <Separator />
                                                <p>
                                                    <b>Samples: </b>Create a
                                                    sample dataset with the
                                                    given number of random files
                                                    from the selected dataset.
                                                </p>
                                                <Separator />
                                                <p>
                                                    <b>Notifications: </b>Enable
                                                    email notification. If set
                                                    to" "<em>Yes</em> you will
                                                    get an email when the rule
                                                    has successfully replicated
                                                    the requested DID.
                                                </p>
                                                <Separator />
                                                <p>
                                                    <b>ADVANCED OPTIONS</b>
                                                </p>
                                                <Separator />
                                                <p>
                                                    <b>Grouping: </b>The
                                                    grouping option defines how
                                                    replicas are distributed, if
                                                    the RSE Expression covers
                                                    multiple RSEs. ALL means
                                                    that all files are written
                                                    to the same RSE (Picked from
                                                    the RSE Expression). DATASET
                                                    means that all files in the
                                                    same dataset are written to
                                                    the same RSE. NONE means
                                                    that all files are spread
                                                    over all possible RSEs of
                                                    the RSE Expression.
                                                    <em>
                                                        A new one is essential
                                                        picked for each file
                                                    </em>
                                                </p>
                                                <Separator />
                                                <p>
                                                    <b>Asynchronous Mode: </b>If
                                                    you have a large requests
                                                    with a lot of datasets/files
                                                    you might check this box. In
                                                    this mode you don't have to
                                                    wait until the server has
                                                    fully evaluated your
                                                    request, but you will have
                                                    to check after some time on
                                                    your rule list if the
                                                    request has been successful.
                                                </p>
                                                <Separator />
                                                <p>
                                                    <b>Copies: </b>The copies
                                                    also only work with RSE
                                                    expression and it defines
                                                    the number of replicas that
                                                    should be created.
                                                </p>
                                                <Separator />
                                                <p>
                                                    <b>Comment: </b>The comment
                                                    is optional unless you want
                                                    to ask for approval. Then
                                                    you have to give a
                                                    justification here.
                                                </p>
                                            </>
                                        ),
                                    })
                                }}
                            >
                                &nbsp;click here.
                            </a>
                        </h6>
                        <Separator />

                        <Input
                            name="lifetime"
                            label="Expiration date"
                            value={lifetimeEntered}
                            type="date"
                            placeholder="Lifetime"
                            onChange={(event: any) => {
                                setLifetimeEntered(event.target.value)
                            }}
                        />

                        <Input
                            name="sample"
                            label="Create Sample"
                            type="number"
                            min={0}
                            placeholder="Amount"
                            onChange={(event: any) => {
                                setsamplesAmountEntered(event.target.value)
                            }}
                        />

                        <div className="rucio-flex m-t-10">
                            <ToggleSwitch
                                label="Turn on Notifications?"
                                checked={notificationsEnabled}
                                handleChange={() => {
                                    setNotificationsEnabled(
                                        !notificationsEnabled,
                                    )
                                }}
                            />

                            <Button
                                label="Advanced Options"
                                kind="secondary"
                                size="medium"
                                show="danger"
                                type="button"
                                onClick={(event: any) => {
                                    setAdvancedEnabled(!advancedEnabled)
                                }}
                            />
                        </div>

                        {advancedEnabled ? (
                            <div>
                                <Separator />
                                <table className="inline_alignment">
                                    <tbody>
                                        <tr>
                                            <td style={{ width: '30%' }}>
                                                <Dropdown
                                                    label="Grouping"
                                                    options={[
                                                        'All',
                                                        'Dataset',
                                                        'None',
                                                    ]}
                                                    handleChange={(
                                                        event: any,
                                                    ) => {
                                                        setGroupingEntered(
                                                            event.target.value,
                                                        )
                                                    }}
                                                />
                                            </td>
                                            <td style={{ width: '30%' }}>
                                                <ToggleSwitch
                                                    label="Asynchronous Mode"
                                                    checked={asynchModeEnabled}
                                                    handleChange={() => {
                                                        setAsynchModeEnabled(
                                                            !notificationsEnabled,
                                                        )
                                                    }}
                                                />
                                            </td>
                                            <td style={{ width: '30%' }}>
                                                <Input
                                                    name="copies"
                                                    kind="info"
                                                    label="Copies"
                                                    value={copiesAmountEntered}
                                                    min={1}
                                                    size="small"
                                                    type="number"
                                                    placeholder="Copies"
                                                    onChange={(event: any) => {
                                                        setCopiesAmountEntered(
                                                            event.target.value,
                                                        )
                                                    }}
                                                />
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                <textarea
                                    style={{
                                        borderRadius: '10px',
                                        padding: '5px 5px 5px 5px',
                                        width: '100%',
                                    }}
                                    rows={3}
                                    placeholder="Comment"
                                    onChange={(event: any) => {
                                        setCommentEntered(event.target.value)
                                    }}
                                ></textarea>
                            </div>
                        ) : null}
                        <Separator />
                        <div style={{ float: 'left' }}>
                            <Button
                                label="&#x2039;&nbsp;Back"
                                kind="outline"
                                type="submit"
                                show="invisible"
                                onClick={() => {
                                    setSelectedStep(1)
                                }}
                            />
                        </div>
                        <div style={{ float: 'right' }}>
                            <Button
                                label="Next&nbsp;&#8250;"
                                kind="outline"
                                type="submit"
                                show="invisible"
                                // disabled={
                                //     typeof lifetimeEntered === "number"
                                // }
                                onClick={(event: any) => {
                                    setSelectedStep(3)
                                }}
                            />
                        </div>
                    </>
                }
            />
        )
    }

    const Summary = () => (
        <Card
            content={
                <>
                    <table>
                        <thead>
                            <th>DID</th>
                            <th>Copies</th>
                            <th>Files</th>
                            <th>Size</th>
                            <th>Requested Size</th>
                        </thead>
                        <tbody>
                            {DIDEntries.map((entry, index) => {
                                return (
                                    <tr>
                                        <td>{entry.toString()}</td>
                                        <td>{copiesAmountEntered}</td>
                                        <td>8342</td>
                                        <td>30.36 TB</td>
                                        <td>30.36 TB</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                    <Separator />
                    <div style={{ float: 'left' }}>
                        <Button
                            label="&#x2039;&nbsp;Back"
                            kind="outline"
                            type="submit"
                            show="invisible"
                            onClick={() => {
                                setSelectedStep(2)
                            }}
                        />
                    </div>
                    <div style={{ float: 'right' }}>
                        <Button
                            label="Submit Request"
                            kind="primary"
                            type="submit"
                            onClick={() => {
                                // navigateToSubmit()
                            }}
                        />
                    </div>
                </>
            }
        />
    )

    return (
        <div className="rule-def">
            <div className="limiter m-t-30">
                <Steps
                    steps={[
                        [
                            'DIDs',
                            'Select Data Identifiers',
                            () => setSelectedStep(0),
                        ],
                        [
                            'RSEs',
                            'Select Rucio Storage Elements',
                            () => setSelectedStep(1),
                        ],
                        [
                            'Options',
                            'Select additional options',
                            () => setSelectedStep(2),
                        ],
                        ['Summary', 'Submit request', () => setSelectedStep(3)],
                    ]}
                    active={selectedStep}
                />
                {selectedStep === 1 ? (
                    <RSE />
                ) : selectedStep === 2 ? (
                    <Options />
                ) : selectedStep === 3 ? (
                    <Summary />
                ) : (
                    <DID />
                )}
            </div>
        </div>
    )
}
